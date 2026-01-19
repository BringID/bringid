import { generateId } from "@/utils"
import { TRequestType, TRequest, TResponse, TSemaphoreProof } from "@/types"
import { TRequestProofs } from "./types" 

export class BringIDSDK {
  private dialogWindowOrigin = window.location.origin;
  private connectDialogReady = false;

  private pendingRequests = new Map<
    string,
    {
      resolve: (v: any) => void,
      reject: (e: any) => void,
      requestType: TRequestType
    }
  >();

  constructor() {
    window.addEventListener("message", this.handleMessage);
  }

  /** SDK notifies ConnectDialog that SDK is ready */
  public markDialogReady() {
    this.connectDialogReady = true;
  }

  /** POSTMESSAGE API */
  private sendMessageToDialog(msg: TRequest) {
    if (!this.connectDialogReady) {
      throw new Error("ConnectDialog is not mounted.");
    }

    console.log('sendMessageToDialog: ', { msg, dialogWindowOrigin: this.dialogWindowOrigin })
    window.postMessage(msg, this.dialogWindowOrigin);
  }

  private handleMessage = (event: MessageEvent) => {
    console.log('handleMessage: ', {
      event,
      dialogWindowOrigin: this.dialogWindowOrigin
    })
    if (event.origin !== this.dialogWindowOrigin) return;

    const data: TResponse = event.data;

    if (!data.requestId) return;

    const pending = this.pendingRequests.get(data.requestId);
    console.log('handleMessage: ', { pending })
    if (!pending) return;

    // i have pending request, that should not be captured

    console.log({ data, pending })
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

  
  /** PUBLIC METHODS */
  requestProofs: TRequestProofs = async (payload: {
    address: string;
    score: string;
  }) => {
    return this.request<{ proofs: TSemaphoreProof[], points: number }>("PROOFS_REQUEST", payload);
  }

}

export default BringIDSDK
