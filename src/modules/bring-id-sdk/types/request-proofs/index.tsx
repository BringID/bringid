import { TSemaphoreProof } from "@/types"

type TArgs = {
  address: string;
  score?: string;
}

type TRequestProofs = (payload: TArgs) => Promise<{
  proofs: TSemaphoreProof[]
  points: number
}>

export default TRequestProofs
