import { api as apiUtil } from '@/utils'
import {
  TGetScore,
  TGetScoreResponse,
} from './get-score'
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

const api = {
  getScore
}

export default api