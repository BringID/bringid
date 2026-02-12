import {
  TInboundMessage,
  TGenerateUserKeyMessage,
  TCloseModalMessage,
  TProofsResponseMessage
} from "@/types"

function isGenerateUserKeyMessage(data: unknown): data is TGenerateUserKeyMessage {
  if (typeof data !== 'object' || data === null) return false
  const msg = data as Record<string, unknown>

  return (
    msg.type === 'GENERATE_USER_KEY' &&
    typeof msg.payload === 'object' &&
    msg.payload !== null &&
    typeof (msg.payload as Record<string, unknown>).message === 'string' &&
    ((msg.payload as Record<string, unknown>).message as string).length > 0
  )
}

function isCloseModalMessage(data: unknown): data is TCloseModalMessage {
  if (typeof data !== 'object' || data === null) return false
  const msg = data as Record<string, unknown>

  return msg.type === 'CLOSE_MODAL'
}

function isValidSemaphoreProof(proof: unknown): boolean {
  if (typeof proof !== 'object' || proof === null) return false
  const p = proof as Record<string, unknown>

  if (typeof p.credential_group_id !== 'string') return false
  if (typeof p.semaphore_proof !== 'object' || p.semaphore_proof === null) return false

  const sp = p.semaphore_proof as Record<string, unknown>
  return (
    typeof sp.merkle_tree_depth === 'number' &&
    typeof sp.merkle_tree_root === 'string' &&
    typeof sp.nullifier === 'string' &&
    typeof sp.message === 'string' &&
    typeof sp.scope === 'string' &&
    Array.isArray(sp.points) &&
    sp.points.every((point: unknown) => typeof point === 'string')
  )
}

function isProofsResponseMessage(data: unknown): data is TProofsResponseMessage {
  if (typeof data !== 'object' || data === null) return false
  const msg = data as Record<string, unknown>

  if (msg.type !== 'PROOFS_RESPONSE') return false

  if (msg.error !== undefined && typeof msg.error !== 'string') return false

  if (msg.payload !== undefined) {
    if (typeof msg.payload !== 'object' || msg.payload === null) return false
    const payload = msg.payload as Record<string, unknown>
    if (!Array.isArray(payload.proofs)) return false
    if (!payload.proofs.every(isValidSemaphoreProof)) return false
    if (typeof payload.points !== 'number' || !Number.isFinite(payload.points)) return false
  }

  return true
}

export default function isValidInboundMessage(data: unknown): data is TInboundMessage {
  return (
    isGenerateUserKeyMessage(data) ||
    isCloseModalMessage(data) ||
    isProofsResponseMessage(data)
  )
}
