import TIsExtensionInstalled from './is-extension-installed'
import TRequestProofs from './request-proofs'

interface IBringIDExtensionSDK {
  isExtensionInstalled: TIsExtensionInstalled
  requestProofs: TRequestProofs
}

export {
  TIsExtensionInstalled,
  TRequestProofs
}

export default IBringIDExtensionSDK
