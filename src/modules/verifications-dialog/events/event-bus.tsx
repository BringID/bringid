import { TSemaphoreProof } from "@/types";

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
