import { api as apiUtil, createQueryString } from '@/utils'
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
      }
    )
}

const verifyProofs: TVerifyProofs = (
  proofs,
  registryAddress
) => {
    return apiUtil<TVerifyProofsResponse>(
      `${configs.ZUPLO_API_URL}/v1/...`,
      'POST',
      {
        'Authorization': `Bearer ${configs.ZUPLO_API_KEY}`,
      },
      {
        proofs,
        registryAddress
      }
    )
}

const api = {
  getScore,
  verifyProofs
}

export default api