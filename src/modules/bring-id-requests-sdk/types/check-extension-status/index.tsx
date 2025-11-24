import { TExtensionStatus } from "@/types"

type TCheckExtensionStatus = () => Promise<{
  status: TExtensionStatus
}>

export default TCheckExtensionStatus
