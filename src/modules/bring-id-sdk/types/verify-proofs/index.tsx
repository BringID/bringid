import { TSemaphoreProof } from "@/types"
import { ethers } from 'ethers'

type TArgs = {
  proofs: TSemaphoreProof[]
  provider?: ethers.JsonRpcProvider
}

type TVerifyProofs = (payload: TArgs) => Promise<boolean>

export default TVerifyProofs
