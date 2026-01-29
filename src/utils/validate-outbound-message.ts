import {
  TOutboundMessage,
  TProofsRequestMessage,
  TUserKeyReadyMessage
} from "@/types"

function isProofsRequestMessage(data: unknown): data is TProofsRequestMessage {
  if (typeof data !== 'object' || data === null) return false
  const msg = data as Record<string, unknown>

  if (msg.type !== 'PROOFS_REQUEST') return false
  if (typeof msg.requestId !== 'string') return false

  if (msg.payload !== undefined) {
    if (typeof msg.payload !== 'object' || msg.payload === null) return false
    const payload = msg.payload as Record<string, unknown>
    if (payload.minPoints !== undefined && typeof payload.minPoints !== 'number') return false
  }

  return true
}

function isUserKeyReadyMessage(data: unknown): data is TUserKeyReadyMessage {
  if (typeof data !== 'object' || data === null) return false
  const msg = data as Record<string, unknown>

  return (
    msg.type === 'USER_KEY_READY' &&
    typeof msg.payload === 'object' &&
    msg.payload !== null &&
    typeof (msg.payload as Record<string, unknown>).signature === 'string'
  )
}

export default function isValidOutboundMessage(data: unknown): data is TOutboundMessage {
  return (
    isProofsRequestMessage(data) ||
    isUserKeyReadyMessage(data)
  )
}
