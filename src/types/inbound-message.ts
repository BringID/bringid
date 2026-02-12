
import TSemaphoreProof from "./semaphore-proof"

export type TGenerateUserKeyMessage = {
  type: 'GENERATE_USER_KEY'
  payload: {
    message: string
  }
 }

export type TCloseModalMessage = {
  type: 'CLOSE_MODAL'
}

export type TProofsResponseMessage = {
  type: 'PROOFS_RESPONSE'
  payload?: {
    proofs: TSemaphoreProof[]
    points: number
  }
  error?: string
}

export type TInboundMessage = TGenerateUserKeyMessage | TCloseModalMessage | TProofsResponseMessage