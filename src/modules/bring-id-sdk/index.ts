import IBringIDSDK, {
  TConstructorArgs,
  TIsExtensionInstalled,
  TRequestProofs
} from './types'

class BringIDSDK implements IBringIDSDK {
  constructor({

  }: TConstructorArgs) {

    window.setInterval(() => {
      console.log('PING...')
      window.postMessage({
        type: 'PING',
      })
    }, 5000)

  }



  isExtensionInstalled: TIsExtensionInstalled = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('SDK::', { window })
        const bringId = (window as any).bringID
        resolve(Boolean(bringId))
      }, 1500)
    })
  }


  requestProofs: TRequestProofs = ({
    drop,
    address,
    pointsRequired
  }) => {

    window.postMessage({
      type: 'REQUEST_PROOFS',
      host: window.location.host,
      dropAddress: drop,
      pointsRequired,
      address
    }, '*')

    return new Promise((resolve, reject) => {
      const listener = (event: any) => {
        switch (event.data.type) {
          //  from client to extension
          case 'RECEIVE_PROOFS': {
            resolve(event.data.data)
            window.removeEventListener("message", listener)
            break
          }

          case 'PROOFS_REJECTED': {
            resolve(null)
            window.removeEventListener("message", listener)
            break
          }
        }
      }
  
      window.addEventListener("message", listener)
    })
  }
  
}

export default BringIDSDK
