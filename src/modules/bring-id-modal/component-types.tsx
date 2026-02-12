import { TGenerateSignature } from "@/types"

export type TProps = {
  address?: string
  generateSignature?: TGenerateSignature
  connectUrl?: string
  iframeOnLoad?: () => void
  highlightColor?: string
  theme?: 'light' | 'dark'
}