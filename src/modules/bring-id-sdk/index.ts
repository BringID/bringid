import { generateId } from "@/utils"
import { TRequestType, TRequest, TResponse, TSemaphoreProof } from "@/types"
import {
  TVerifyHumanity,
  TGetAddressScore
} from "./types" 
import api from "@/api";

export class BringID {
  private dialogWindowOrigin = ''

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

  /** POSTMESSAGE API */
  private sendMessageToDialog(msg: TRequest) {
    console.log('sendMessageToDialog: ', { msg, dialogWindowOrigin: this.dialogWindowOrigin })
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
  verifyHumanity: TVerifyHumanity = async (payload) => {
    return this.request<{ proofs: TSemaphoreProof[], points: number }>("PROOFS_REQUEST", payload);
  }

  getAddressScore: TGetAddressScore = async (
    address
  ) => {

    const { score } = await api.getScore(address)
    return {
      score
    }
  }

}

export default BringID
