import { TSemaphoreProof } from "../../../../types"

type TRequestProofsArgs = {
  drop: string
  pointsRequired: number
  address: string
}

type TRequestProofs = (args: TRequestProofsArgs) => Promise<TSemaphoreProof[] | null>

export default TRequestProofs
