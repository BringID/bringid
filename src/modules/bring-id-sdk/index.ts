import { fetchRegistryConfig } from "@/utils"
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
import { REGISTRY_ABI, MULTICALL3_ABI, SCORER_ABI } from "@/abi"
import { ethers } from 'ethers'
import configs from "@/configs"

export class BringID {
  private dialogWindowOrigin = ''
  private isDestroyed = false
  private appId: string
  private mode: TMode = 'production'

  private pendingRequest: {
    resolve: (v: any) => void,
    reject: (e: any) => void,
  } | null = null;

  constructor(args: TConstructorArgs) {
    this.appId = args.appId

    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleMessage);
      this.dialogWindowOrigin = window.location.origin
    }

    if (args.mode) {
      this.mode = args.mode
    }
  }

  getMode = () => {
    return this.mode
  }

  setMode = (mode: TMode) => {
    this.mode = mode
  }

  getAppId = () => {
    return this.appId
  }

  setAppId = (appId: string) => {
    this.appId = appId
  }

  destroy: TDestroy = () => {
    if (this.isDestroyed) return
    this.isDestroyed = true
    if (typeof window !== "undefined") {
      window.removeEventListener("message", this.handleMessage)
    }
    this.rejectPendingRequest('DESTROYED')
  }

  /** POSTMESSAGE API */
  private sendMessageToDialog(msg: TRequest) {
    window.postMessage(msg, this.dialogWindowOrigin);
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.origin !== this.dialogWindowOrigin) return;

    const data: TResponse = event.data;

    if (data.type === 'CLOSE_MODAL') {
      this.rejectPendingRequest('REJECTED')
      return
    }

    if (data.type === 'PROOFS_RESPONSE' && this.pendingRequest) {
      const { resolve, reject } = this.pendingRequest
      this.pendingRequest = null

      if (data.error) reject(data.error);
      else resolve(data.payload);
    }
  };

  private sendRequest<T>(type: TRequestType, payload?: any): Promise<T> {
    this.rejectPendingRequest('REJECTED')

    return new Promise<T>((resolve, reject) => {
      this.pendingRequest = { resolve, reject };
      this.sendMessageToDialog({ type, payload });
    });
  }

  private rejectPendingRequest(error: any): void {
    if (this.pendingRequest) {
      this.pendingRequest.reject(error)
      this.pendingRequest = null
    }
  }

  /** PUBLIC METHODS */
  verifyHumanity: TVerifyHumanity = async (payload = {}) => {
    if (!payload.minPoints) {
      payload = { ...payload, minPoints: 0 }
    }
    return this.sendRequest<{ proofs: TSemaphoreProof[], points: number }>("PROOFS_REQUEST", {
      ...payload,
      mode: this.mode,
      appId: this.appId
    });
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
    const failedResult = {
      verified: false,
      score: {
        total: 0,
        groups: []
      }
    }

    const registryConfig = await fetchRegistryConfig(this.mode)

    if (!registryConfig) {
      throw new Error('configs cannot be fetched')
    }

    const registryInterface = new ethers.Interface(REGISTRY_ABI)
    const multicall3Interface = new ethers.Interface(MULTICALL3_ABI)
    const scorerInterface = new ethers.Interface(SCORER_ABI)

    const credentialGroupProofs = proofs.map((proof) => ({
      credentialGroupId: proof.credential_group_id,
      appId: proof.app_id,
      semaphoreProof: {
        merkleTreeDepth: proof.semaphore_proof.merkle_tree_depth,
        merkleTreeRoot: proof.semaphore_proof.merkle_tree_root,
        nullifier: proof.semaphore_proof.nullifier,
        message: proof.semaphore_proof.message,
        scope: proof.semaphore_proof.scope,
        points: proof.semaphore_proof.points
      }
    }))

    // Build Multicall3 calls: verifyProof for each proof + getScore for total
    const verifyCalls: TCall3[] = credentialGroupProofs.map((credentialGroupProof) => {
      const callData = registryInterface.encodeFunctionData('verifyProof', [
        0,
        credentialGroupProof
      ])

      return {
        target: registryConfig.REGISTRY,
        allowFailure: false,
        callData
      }
    })

    // Get the app's scorer address
    const appData = await new ethers.Contract(
      registryConfig.REGISTRY,
      REGISTRY_ABI,
      provider
    ).apps(this.appId)

    const scorerAddress = appData.scorer

    // Build scorer calls for per-group scores
    const scorerCalls: TCall3[] = proofs.map((proof) => {
      const callData = scorerInterface.encodeFunctionData('getScore', [
        proof.credential_group_id
      ])

      return {
        target: scorerAddress,
        allowFailure: false,
        callData
      }
    })

    const allCalls = [...verifyCalls, ...scorerCalls]
    const multicallData = multicall3Interface.encodeFunctionData('aggregate3', [allCalls])

    try {
      const result = await provider.call({
        to: configs.MULTICALL3_ADDRESS,
        data: multicallData
      })

      const decoded = multicall3Interface.decodeFunctionResult('aggregate3', result)
      const results = decoded[0]

      // Check all verify calls succeeded
      const verifyResults = results.slice(0, proofs.length)
      const allVerified = verifyResults.every((r: any) => {
        const [verified] = registryInterface.decodeFunctionResult('verifyProof', r.returnData)
        return verified
      })

      if (!allVerified) {
        return failedResult
      }

      // Decode scorer results
      const scorerResults = results.slice(proofs.length)
      const groups = proofs.map((proof, i) => {
        const [groupScore] = scorerInterface.decodeFunctionResult('getScore', scorerResults[i].returnData)
        return {
          credential_group_id: proof.credential_group_id,
          score: Number(groupScore)
        }
      })

      const total = groups.reduce((sum, g) => sum + g.score, 0)

      return {
        verified: true,
        score: {
          total,
          groups
        }
      }
    } catch (err) {
      console.error(err)
      return failedResult
    }
  }

}

export default BringID
