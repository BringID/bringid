import { TGenerateSignature } from "@/types"

export type TProps = {
  apiKey?: string
  address?: string
  generateSignature?: TGenerateSignature
  connectUrl?: string
  scope?: string
  iframeOnLoad: () => void
}