import { TSemaphoreProof } from "@/types"

type TArgs = {
  minPoints?: number;
  contract?: string;
  context?: number;
  message?: string;
}

type TVerifyHumanity = (payload?: TArgs) => Promise<{
  proofs: TSemaphoreProof[]
  points: number
}>

export default TVerifyHumanity
