type TGetScoreResponse = Promise<{
  success: boolean,
  score: number
}>

type TGetScore = (
  address: string
) => Promise<TGetScoreResponse>

export type {
  TGetScoreResponse,
  TGetScore
}