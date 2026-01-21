type TGetAddressScore = (
  address: string
) => Promise<{
  score: number
}>

export default TGetAddressScore
