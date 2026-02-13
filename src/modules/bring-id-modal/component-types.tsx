import { TGenerateSignature } from "@/types"

export type TCustomTitles = {
  pointsTitle: string
  pointsShortTitle: string
  scoreTitle: string
}

export type TProps = {
  address?: string
  generateSignature?: TGenerateSignature
  connectUrl?: string
  iframeOnLoad?: () => void
  highlightColor?: string
  theme?: 'light' | 'dark'
  customTitles?: TCustomTitles
}