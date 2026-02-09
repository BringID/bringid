import { TSemaphoreProof } from "@/types"

type TArgs = {
  minPoints?: number;
  scope?: string;
  message?: string;
}

type TVerifyHumanity = (payload?: TArgs) => Promise<{
  proofs: TSemaphoreProof[]
  points: number
}>

export default TVerifyHumanity
