import { TScoreMessage } from "@/types"

type TGetScoreResponse = Promise<{
  success: boolean,
  score: number,
  signature: string,
  message: TScoreMessage
}>

type TGetScore = (
  address: string
) => Promise<TGetScoreResponse>

export type {
  TGetScoreResponse,
  TGetScore
}