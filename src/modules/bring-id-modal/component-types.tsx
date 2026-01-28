import { TGenerateSignature } from "@/types"

export type TProps = {
  address?: string
  generateSignature?: TGenerateSignature
  connectUrl?: string
  iframeOnLoad?: () => void
  mode?: 'dev' | 'production'
  highlightColor?: string
  theme?: 'light' | 'dark'
}