import { api as apiUtil } from '@/utils'
import {
  TGetScore,
  TGetScoreResponse,
} from './get-score'
import {
  TVerifyProofsResponse,
  TVerifyProofs
} from './verify-proofs'
import configs from '../configs'

const getScore: TGetScore = (
  address
) => {
    return apiUtil<TGetScoreResponse>(
      `${configs.ZUPLO_API_URL}/v1/score/address/${address}`,
      'GET',
      {
        'Authorization': `Bearer ${configs.ZUPLO_API_KEY}`,
        'content-type': 'application/json',

      }
    )
}

const verifyProofs: TVerifyProofs = (
  proofs,
  chainId,
  registryAddress
) => {
    return apiUtil<TVerifyProofsResponse>(
      `${configs.ZUPLO_API_URL}/v1/proofs/verify`,
      'POST',
      {
        'Authorization': `Bearer ${configs.ZUPLO_API_KEY}`,
        'content-type': 'application/json'
      },
      {
        proofs,
        registry: registryAddress,
        chain_id: chainId
      }
    )
}

const api = {
  getScore,
  verifyProofs
}

export default api