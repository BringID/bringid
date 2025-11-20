import IBringIDExtensionSDK, {
  TIsExtensionInstalled,
  TRequestProofs
} from './types'

class BringIDExtensionSDK implements IBringIDExtensionSDK {
  isExtensionInstalled: TIsExtensionInstalled = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('SDK::', { window })
        const bringId = (window as any).bringID
        resolve(Boolean(bringId))
      }, 1500)
    })
  }

  requestProofs: TRequestProofs = async ({
    drop,
    address,
    pointsRequired
  }) => {

    try {

      window.postMessage({
        type: 'PING',
      })
      // to wake background script up

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
              resolve({
                proofs: event.data.data.proofs,
                points: event.data.data.points
              })
              window.removeEventListener("message", listener)
              break
            }

            case 'PROOFS_REJECTED': {
              resolve({
                proofs: null,
                points: 0
              })
              break
            }
          }
        }
    
        window.addEventListener("message", listener)
      })
    } catch (error) {
      console.log({ error })
      return {
        proofs: null,
        points: 0
      }
    }
  }
}

export default BringIDExtensionSDK
