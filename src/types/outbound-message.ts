export type TProofsRequestMessage = {
  type: 'PROOFS_REQUEST'
  requestId: string
  payload: {
    minPoints?: number
  }
}

export type TUserKeyReadyMessage = {
  type: 'USER_KEY_READY'
  payload: {
    signature: string
  }
}

export type TOutboundMessage = TProofsRequestMessage | TUserKeyReadyMessage