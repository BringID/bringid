import { TSemaphoreProof } from "@/types";

type ProofsCallback = (
  proofs: TSemaphoreProof[],
  points: number
) => void;

let proofsGeneratedCallback: ProofsCallback | null = null;

export const setProofsGeneratedCallback = (cb: ProofsCallback) => {
  proofsGeneratedCallback = cb;
};

export const callProofsGeneratedCallback = (
  proofs: TSemaphoreProof[],
  points: number
) => {
  if (!proofsGeneratedCallback) {
    throw new Error("Proofs callback not registered");
  }

  proofsGeneratedCallback(proofs, points);
  proofsGeneratedCallback = null;
};