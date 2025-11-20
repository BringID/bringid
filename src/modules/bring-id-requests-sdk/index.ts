import { generateId } from "@/utils"
import { TRequestType, TRequest, TResponse } from "@/types"

export class BringIDRequestsSDK {
  private dialogWindowOrigin = window.location.origin;
  private connectDialogReady = false;

  private pendingRequests = new Map<
    string,
    { resolve: (v: any) => void; reject: (e: any) => void }
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
    window.postMessage(msg, this.dialogWindowOrigin);
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.origin !== this.dialogWindowOrigin) return;

    const data: TResponse = event.data;
    if (!data.requestId) return;

    const pending = this.pendingRequests.get(data.requestId);
    if (!pending) return;

    this.pendingRequests.delete(data.requestId);

    if (data.error) pending.reject(data.error);
    else pending.resolve(data.payload);
  };

  /** Helper to wrap messages as promises */
  private request(type: TRequestType, payload?: any) {
    return new Promise((resolve, reject) => {
      const requestId = generateId();

      this.pendingRequests.set(requestId, { resolve, reject });

      this.sendMessageToDialog({ type, requestId, payload });
    });
  }

  /** PUBLIC METHODS */

  async checkExtensionStatus() {
    return this.request("CHECK_EXTENSION_STATUS_REQUEST");
  }

  async requestProofs(payload: {
    drop: string;
    address: string;
    pointsRequired: number;
  }) {
    return this.request("PROOFS_REQUEST", payload);
  }
}

export default BringIDRequestsSDK
