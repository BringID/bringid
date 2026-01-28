import { generateId } from "@/utils"
import {
  TRequestType,
  TRequest,
  TResponse,
  TSemaphoreProof
} from "@/types"
import {
  TVerifyHumanity,
  TGetAddressScore,
  TDestroy
} from "./types" 
import api from "@/api"

export class BringID {
  private dialogWindowOrigin = ''
  private isDestroyed = false
  
  private pendingRequests = new Map<
    string,
    {
      resolve: (v: any) => void,
      reject: (e: any) => void,
      requestType: TRequestType
    }
  >();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleMessage);
      this.dialogWindowOrigin = window.location.origin
    }
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

}

export default BringID
