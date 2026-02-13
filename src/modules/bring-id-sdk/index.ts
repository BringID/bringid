import { fetchRegistryConfig } from "@/utils"
import {
  TRequestType,
  TRequest,
  TResponse,
  TSemaphoreProof,
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
import { REGISTRY_ABI, SCORER_ABI } from "@/abi"
import { ethers } from 'ethers'

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
    return this.sendRequest<{ proofs: TSemaphoreProof[], points: number }>("PROOFS_REQUEST", {
      minPoints: 0,
      context: 0,
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
    provider,
    context,
    contract
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

    const registry = new ethers.Contract(
      registryConfig.REGISTRY,
      REGISTRY_ABI,
      provider
    )

    try {
      const contextValue = context ?? 0
      const fromAddress = contract ?? registryConfig.REGISTRY

      const verified = await registry.verifyProofs.staticCall(contextValue, credentialGroupProofs, { from: fromAddress })

      if (!verified) {
        return failedResult
      }

      // Get scorer address for this app
      const appData = await registry.apps(this.appId)
      const scorerAddress = appData.scorer

      // Fetch per-group scores from the scorer contract
      const scorer = new ethers.Contract(scorerAddress, SCORER_ABI, provider)
      const groupIds = proofs.map((proof) => proof.credential_group_id)
      const scores = await scorer.getScores(groupIds)

      const groups = proofs.map((proof, i) => ({
        credential_group_id: proof.credential_group_id,
        score: Number(scores[i])
      }))

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
