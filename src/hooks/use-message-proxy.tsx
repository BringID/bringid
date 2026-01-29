import { useEffect } from "react"
import { TGenerateSignature, TInboundMessage } from "@/types"
import { isValidInboundMessage, isValidOutboundMessage } from "@/utils"

function useMessageProxy(
  isReady: boolean,
  iframeRef,
  connectUrl: string,
  setVisible: (visible: boolean) => void,
  generateSignature?: TGenerateSignature
) {
  useEffect(() => {

    if (typeof window === "undefined") return

    const widgetOrigin = new URL(connectUrl).origin
  
    async function onMessage(event: MessageEvent) {
      const fromOrigin = event.origin;
      const data = event.data;

      // From WEBSITE where CURRENT SDK is used → forward to iframe WIDGET
      if (fromOrigin === window.location.origin) {

        if (!iframeRef.current) return;

        // Validate outbound message structure
        if (!isValidOutboundMessage(data)) {
          return
        }

        if (data.type === 'PROOFS_REQUEST') {
          if (!isReady) {
            return alert('Modal window is not ready yet')
          }
          setVisible(true)
        }

        iframeRef.current.contentWindow?.postMessage(
          data,
          widgetOrigin
        );
        return;
      }

      // From WIDGET iframe → forward to CURRENT SDK
      if (fromOrigin === widgetOrigin) {

        // Validate inbound message structure
        if (!isValidInboundMessage(data)) {
          console.error('Invalid inbound message structure from widget')
          return
        }

        const validData = data as TInboundMessage

        if (validData.type === 'GENERATE_USER_KEY') {
          if (generateSignature) {
            const message = validData.payload.message

            const EXPECTED_CONTENT = 'BringID key'
            if (!message.includes(EXPECTED_CONTENT)) {
              console.error('Invalid signature request: message must contain `BringID key`')
              return
            }

            const signature = await generateSignature(message)

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
          validData.type === 'CLOSE_MODAL' ||
          validData.type === 'PROOFS_RESPONSE'
        ) {
          setVisible(false)
        }

        // proxy to WEBSITE where CURRENT SDK is used
        window.postMessage(validData, window.location.origin);
        return;
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [
    generateSignature,
    isReady,
    connectUrl,
    setVisible,
    iframeRef
  ])
}

export default useMessageProxy