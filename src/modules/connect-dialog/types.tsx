import { TSemaphoreProof, TExtensionStatus } from "@/types"

export type TProps = {
  visible?: boolean
  setVisible: (visible: boolean) => void
  iframeOnLoad: () => void
  connectUrl?: string
  onLogin?: () => void
  onLogout?: () => void
}