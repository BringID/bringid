import { TScoreMessage } from "@/types"

type TGetAddressScore = (
  address: string
) => Promise<{
  score: number,
  message: TScoreMessage,
  signature: string
}>

export default TGetAddressScore
