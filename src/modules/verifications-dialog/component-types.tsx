import { TGenerateSignature } from "@/types"

export type TProps = {
  apiKey?: string
  address?: string
  generateSignature?: TGenerateSignature
  connectUrl?: string
  onLogin?: () => void
  onLogout?: () => void
  visible?: boolean
  iframeOnLoad: () => void
  setVisible: (visible: boolean) => void
}