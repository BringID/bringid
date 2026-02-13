export type TProofsRequestMessage = {
  type: 'PROOFS_REQUEST'
  payload: {
    minPoints?: number
    mode?: string
    appId?: string
  }
}

export type TUserKeyReadyMessage = {
  type: 'USER_KEY_READY'
  payload: {
    signature: string
  }
}

export type TOutboundMessage = TProofsRequestMessage | TUserKeyReadyMessage