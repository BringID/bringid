import { TSemaphoreProof } from "@/types";

type TRequestProofsCallbackArgs = {
  pointsRequired: number,
  scope?: string
}
type TRequestProofsCallback = (args: TRequestProofsCallbackArgs) => Promise<any>;
let requestProofsCallback: TRequestProofsCallback | null = null;
export const registerRequestProofs = (cb: TRequestProofsCallback) => {
  requestProofsCallback = cb;
};

export const triggerRequest = (args: TRequestProofsCallbackArgs) => {
  if (!requestProofsCallback) {
    return Promise.reject('requestProofs is not registered');
  }
  if (requestProofsCallback) return requestProofsCallback(args);
};


type TOpenModalArgs = {
  proofsGeneratedCallback: (
    proofs: TSemaphoreProof[],
    points: number
  ) => void,
  scope?: string
}

type TOpenModalCallback = (args: TOpenModalArgs) => void;
let openModalCallback: TOpenModalCallback | null = null;

export const registerOpenModal = (cb: TOpenModalCallback) => {
  openModalCallback = cb;
};

export const triggerOpenModal = (args: TOpenModalArgs) => {
  if (openModalCallback) openModalCallback(
    args
  );
};


export { triggerOpenModal as openModal };
export { triggerRequest as requestProofs };
