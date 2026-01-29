import { TGenerateSignature, TMode } from "@/types"

export type TProps = {
  address?: string
  generateSignature?: TGenerateSignature
  connectUrl?: string
  iframeOnLoad?: () => void
  mode?: TMode,
  highlightColor?: string
  theme?: 'light' | 'dark'
}