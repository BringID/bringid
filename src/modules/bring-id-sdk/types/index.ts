import TConstructorArgs from './constructor-args'
import TIsExtensionInstalled from './is-extension-installed'
import TRequestProofs from './request-proofs'

interface IBringIDSDK {
  isExtensionInstalled: TIsExtensionInstalled
  requestProofs: TRequestProofs
}

export {
  TConstructorArgs,
  TIsExtensionInstalled,
  TRequestProofs
}

export default IBringIDSDK
