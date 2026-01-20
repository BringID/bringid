import { TSemaphoreProof } from "@/types"

type TArgs = {
  scope?: string;
}

type TVerifyHumanity = (payload?: TArgs) => Promise<{
  proofs: TSemaphoreProof[]
  points: number
}>

export default TVerifyHumanity
