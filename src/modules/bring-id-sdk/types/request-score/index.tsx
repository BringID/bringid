type TRequestScore = (
  address: string
) => Promise<{
  score: number
}>

export default TRequestScore
