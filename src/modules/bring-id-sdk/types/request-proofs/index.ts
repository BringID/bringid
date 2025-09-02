import { TSemaphoreProof } from "../../../../types"

type TRequestProofsArgs = {
  drop: string
  pointsRequired: number
  address: string
}

type TRequestProofs = (args: TRequestProofsArgs) => Promise<{
  proofs: TSemaphoreProof[] | null
  points: number
}>

export default TRequestProofs
