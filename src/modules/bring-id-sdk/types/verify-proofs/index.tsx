import { TSemaphoreProof } from "@/types"
import { ethers } from 'ethers'

type TArgs = {
  proofs: TSemaphoreProof[]
  provider: ethers.JsonRpcProvider
}

type TCredentialGroupScore = {
  credential_group_id: string
  score: number
}

type TVerifyProofsResult = {
  verified: boolean
  score: {
    total: number
    groups: TCredentialGroupScore[]
  }
}

type TVerifyProofs = (payload: TArgs) => Promise<TVerifyProofsResult>

export default TVerifyProofs
export type { TVerifyProofsResult, TCredentialGroupScore }
