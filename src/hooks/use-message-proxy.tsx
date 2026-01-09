import { useEffect } from "react"
import { TGenerateSignature, TSemaphoreProof } from "@/types"

function useMessageProxy(
  iframeRef,
  connectUrl: string,
  setVisible: (visible: boolean) => void,
  proofsGeneratedCallback: ((
    proofs: TSemaphoreProof[],
    points: number
  ) => void) | null,
  generateSignature?: TGenerateSignature
) {
  useEffect(() => {
    async function onMessage(event: MessageEvent) {
      const fromOrigin = event.origin;
      const data = event.data;

      // From WEBSITE where CURRENT SDK is used → forward to iframe WIDGET
      if (fromOrigin === window.location.origin) {
        if (!iframeRef.current) return;

        iframeRef.current.contentWindow?.postMessage(
          data,
          connectUrl
        );
        return;
      }

      // From WIDGET iframe → forward to CURRENT SDK
      if (fromOrigin === connectUrl) {

        if (data.type === 'GENERATE_USER_KEY') {
          if (generateSignature) {
            const signature = await generateSignature(data.payload.message)

            // send back to iframe
            iframeRef.current.contentWindow?.postMessage(
              {
                type: 'USER_KEY_READY',
                payload: {
                  signature
                }
              },
              connectUrl
            )
            return
          } else {
            return alert('generateSignature IS NOT AVAILABLE')
          } 
        }


        if (data.type === 'PROOFS_READY') {

          console.log('PROOFS_READY IN SDK', { data })
          const {
            payload: {
              proofs,
              points
            }
          }: {
            payload: {
              proofs: TSemaphoreProof[],
              points: number
            }
          } = data
          if (!proofsGeneratedCallback) {
            return alert('proofsGeneratedCallback IS NOT AVAILABLE')
          }

          proofsGeneratedCallback(
            proofs,
            points
          )

          setVisible(false)



          return
        }

        // proxy to WEBSITE where CURRENT SDK is used
        window.postMessage(data, window.location.origin);
        return;
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [
    generateSignature,
    proofsGeneratedCallback
  ]);
}

export default useMessageProxy