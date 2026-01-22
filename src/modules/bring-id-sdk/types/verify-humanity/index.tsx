import { TSemaphoreProof } from "@/types"

type TArgs = {
  minPoints?: number;
  scope?: string;
}

type TVerifyHumanity = (payload?: TArgs) => Promise<{
  proofs: TSemaphoreProof[]
  points: number
}>

export default TVerifyHumanity
