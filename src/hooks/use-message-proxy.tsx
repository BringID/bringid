import { useEffect } from "react"
import { TGenerateSignature, TSemaphoreProof } from "@/types"

function useMessageProxy(
  isReady: boolean,
  iframeRef,
  connectUrl: string,
  setVisible: (visible: boolean) => void,
  generateSignature?: TGenerateSignature
) {
  useEffect(() => {
    async function onMessage(event: MessageEvent) {
      const fromOrigin = event.origin;
      const data = event.data;

      // From WEBSITE where CURRENT SDK is used → forward to iframe WIDGET
      if (fromOrigin === window.location.origin) {

        if (!iframeRef.current) return;

        if (data.type === 'PROOFS_REQUEST') {
          if (!isReady) {
            return alert('Modal window is not ready yet')
          }
          setVisible(true)
        }

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

        if (
          data.type === 'CLOSE_MODAL' ||
          data.type === 'PROOFS_RESPONSE'
        ) {
          setVisible(false)
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
    isReady
  ]);
}

export default useMessageProxy