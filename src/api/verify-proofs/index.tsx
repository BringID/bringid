import { TSemaphoreProof } from "@/types"

type TVerifyProofsResponse = Promise<{
  success: boolean,
  result: boolean
}>

type TVerifyProofs = (
  proofs: TSemaphoreProof[],
  chainId: number,
  registryAddress: string
) => Promise<TVerifyProofsResponse>

export type {
  TVerifyProofsResponse,
  TVerifyProofs
}