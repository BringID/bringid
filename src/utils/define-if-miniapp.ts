import { sdk } from '@farcaster/miniapp-sdk'

let _result: boolean | null = null

const isInMiniApp = async (): Promise<boolean> => {
  if (_result !== null) return _result
  _result = await sdk.isInMiniApp()
  return _result
}

export default isInMiniApp
