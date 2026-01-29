import { fetchRegistryConfig, generateId } from "@/utils"
import {
  TRequestType,
  TRequest,
  TResponse,
  TSemaphoreProof,
  TCall3,
  TMode
} from "@/types"
import {
  TVerifyHumanity,
  TGetAddressScore,
  TDestroy,
  TVerifyProofs,
  TConstructorArgs
} from "./types" 
import api from "@/api"
import { REGISTRY_ABI, MULTICALL3_ABI } from "@/abi"
import { ethers } from 'ethers'
import configs from "@/configs"

export class BringID {
  private dialogWindowOrigin = ''
  private isDestroyed = false
  private mode: TMode = 'production'
  
  private pendingRequests = new Map<
    string,
    {
      resolve: (v: any) => void,
      reject: (e: any) => void,
      requestType: TRequestType
    }
  >();

  constructor(args?: TConstructorArgs) {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleMessage);
      this.dialogWindowOrigin = window.location.origin
    }

    if (args && args.mode) {
      this.mode = args.mode
    }
  }

  getMode = () => {
    return this.mode
  }

  destroy: TDestroy = () => {
    if (this.isDestroyed) return
    this.isDestroyed = true
    if (typeof window !== "undefined") {
      window.removeEventListener("message", this.handleMessage)
    }
    this.rejectAllPendingRequests('DESTROYED')
  }

  /** POSTMESSAGE API */
  private sendMessageToDialog(msg: TRequest) {
    window.postMessage(msg, this.dialogWindowOrigin);
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.origin !== this.dialogWindowOrigin) return;

    const data: TResponse = event.data;

    if (!data.requestId) {
      return
    }

    if (data.type === 'CLOSE_MODAL') {
      this.rejectAllPendingRequests('REJECTED')
      return
    }

    const pending = this.pendingRequests.get(data.requestId);
    if (!pending) return;

    // i have pending request, that should not be captured
    if (pending.requestType === data.type) { return }

    this.pendingRequests.delete(data.requestId);

    if (data.error) pending.reject(data.error);
    else pending.resolve(data.payload);
  };

  /** Helper to wrap messages as promises */
  private request<T>(type: TRequestType, payload?: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const requestId = generateId();
      this.pendingRequests.set(requestId, { resolve, reject, requestType: type });

      this.sendMessageToDialog({ type, requestId, payload });
    });
  }

  private rejectAllPendingRequests(error: any): void {
    for (const { reject } of this.pendingRequests.values()) {
      reject(error);
    }

    this.pendingRequests.clear();
  }

  /** PUBLIC METHODS */
  verifyHumanity: TVerifyHumanity = async (payload = {}) => {
    if (!payload.minPoints) {
      payload = { ...payload, minPoints: 0 }
    }
    return this.request<{ proofs: TSemaphoreProof[], points: number }>("PROOFS_REQUEST", payload);
  }

  getAddressScore: TGetAddressScore = async (
    address
  ) => {
    if (!address) {
      throw new Error('`address` argument is required to get address score')
    }
    const {
      score,
      message,
      signature
    } = await api.getScore(address)

    return {
      score,
      message,
      signature
    }
  }


  verifyProofs: TVerifyProofs = async ({
    proofs,
    provider
  }) => {


    const registryConfig = await fetchRegistryConfig(this.mode)

    if (!registryConfig) {
      throw new Error('configs cannot be fetched')
    }

    const registryInterface = new ethers.Interface(REGISTRY_ABI)
    const multicall3Interface = new ethers.Interface(MULTICALL3_ABI)

    if (!provider) {
      try {
        const {
          result
        } = await api.verifyProofs(
          proofs,
          Number(registryConfig.CHAIN_ID),
          registryConfig.REGISTRY
        )

        return result
      } catch (err) {
        console.error(err)
        return false
      } 
    }

    // Build multicall data
    const calls: TCall3[] = proofs.map((proof) => {
      const credentialGroupProof = {
        credentialGroupId: proof.credential_group_id,
        semaphoreProof: {
          merkleTreeDepth: proof.semaphore_proof.merkle_tree_depth,
          merkleTreeRoot: proof.semaphore_proof.merkle_tree_root,
          nullifier: proof.semaphore_proof.nullifier,
          message: proof.semaphore_proof.message,
          scope: proof.semaphore_proof.scope,
          points: proof.semaphore_proof.points
        }
      }

      const callData = registryInterface.encodeFunctionData('verifyProof', [
        credentialGroupProof
      ])

      return {
        target: registryConfig.REGISTRY,
        allowFailure: false,
        callData
      }
    })

    const multicallData = multicall3Interface.encodeFunctionData('aggregate3', [calls])

    try {
      await provider.call({
        to: configs.MULTICALL3_ADDRESS,
        data: multicallData
      })
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

}

export default BringID
