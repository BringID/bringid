import { TSemaphoreProof, TExtensionStatus } from "@/types"

export type TProps = {
  visible?: boolean
  setVisible: (visible: boolean) => void
  setProofs: (proofs: TSemaphoreProof[]) => void
  setSelectedPoints: (selectedPoints: number) => void
  iframeOnLoad: () => void
  onExtensionStatusResponse: (status: TExtensionStatus) => TExtensionStatus
}