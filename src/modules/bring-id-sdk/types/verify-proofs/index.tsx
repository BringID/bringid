import { TSemaphoreProof } from "@/types"
import { ethers } from 'ethers'

type TArgs = {
  proofs: TSemaphoreProof[]
  provider?: ethers.JsonRpcProvider
}

type TCredentialGroupPoints = {
  credential_group_id: string
  points: number
}

type TVerifyProofsResult = {
  verified: boolean
  points: {
    total: number
    groups: TCredentialGroupPoints[]
  }
}

type TVerifyProofs = (payload: TArgs) => Promise<TVerifyProofsResult>

export default TVerifyProofs
export type { TVerifyProofsResult, TCredentialGroupPoints }
