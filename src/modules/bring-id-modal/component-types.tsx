import { TGenerateSignature } from "@/types"

export type TProps = {
  apiKey?: string
  address?: string
  generateSignature?: TGenerateSignature
  connectUrl?: string
  iframeOnLoad?: () => void
  mode?: 'dev' | 'production'
  highlightColor?: string
}