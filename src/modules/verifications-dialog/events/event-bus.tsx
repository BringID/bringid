type OpenModalCallback = () => void;

type RequestProofsCallback = (
  dropAddress: string,
  pointsRequired: number
) => Promise<any>;

let openModalCallback: OpenModalCallback | null = null;
let requestProofsCallback: RequestProofsCallback | null = null;


export const registerOpenModal = (cb: OpenModalCallback) => {
  openModalCallback = cb;
};

export const registerRequestProofs = (cb: RequestProofsCallback) => {
  requestProofsCallback = cb;
};

export const triggerOpenModal = () => {
  if (openModalCallback) openModalCallback();
};

export const triggerRequest = (
  dropAddress: string,
  pointsRequired: number
) => {
  if (!requestProofsCallback) {
    return Promise.reject('requestProofs is not registered');
  }
  if (requestProofsCallback) return requestProofsCallback(
    dropAddress,
    pointsRequired
  );
};

export { triggerOpenModal as openModal };
export { triggerRequest as requestProofs };
