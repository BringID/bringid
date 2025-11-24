import { TSemaphoreProof } from "@/types"

type TArgs = {
  drop: string;
  address: string;
  pointsRequired: number;
}

type TRequestProofs = (payload: TArgs) => Promise<{
  proofs: TSemaphoreProof[]
  points: number
}>

export default TRequestProofs
