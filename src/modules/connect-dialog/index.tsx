import { FC, useEffect, useRef } from 'react'
import {
  DialogStyled,
  IFrame
} from './styled-components'
import { TProps } from './types'
import { ThemeProvider } from 'styled-components'
import { light } from '@/themes'

const ConnectDialog: FC<TProps> = ({
  visible,
  setVisible,
  setProofs,
  setSelectedPoints,
  iframeOnLoad,
  onExtensionStatusResponse
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    window.addEventListener("message", async (event) => {
      if (event.origin === window.location.origin) { // verify messages from current host
        if (event.data.type === 'CONNECT') {
          setVisible(true)
          return
        };

        if (event.data.type === 'CHECK_IF_EXTENSION_IS_INSTALLED_AND_CONNECTED') {
          console.log({ iframeRef })
          iframeRef && iframeRef.current?.contentWindow?.postMessage({
            type: 'CHECK_IF_EXTENSION_IS_INSTALLED_AND_CONNECTED',
          }, 'https://connect.bringid.org') // to connect
          return
        };

        if (event.data.type === 'ASK_FOR_ROOFS') {
          const {
            drop,
            address,
            pointsRequired
          } = event.data
          console.log({ iframeRef })
          if (!iframeRef.current) { return }

          iframeRef && iframeRef.current?.contentWindow?.postMessage({
            type: 'ASK_FOR_ROOFS',
            drop,
            address,
            pointsRequired
          }, 'https://connect.bringid.org') // to connect

        };
        return;
      }

      if (event.origin === 'https://connect.bringid.org') { // verify messages from connect host
        if (event.data.type === 'IS_CONNECTED') {
          setVisible(false)
          onExtensionStatusResponse('EXTENSION_IS_INSTALLED_AND_CONNECTED')
          return
        };

        if (event.data.type === 'EXTENSION_IS_INSTALLED_AND_CONNECTED') {
          onExtensionStatusResponse('EXTENSION_IS_INSTALLED_AND_CONNECTED')
          return
        };

        if (event.data.type === 'EXTENSION_IS_INSTALLED_AND_NOT_CONNECTED') {
          onExtensionStatusResponse('EXTENSION_IS_INSTALLED_AND_NOT_CONNECTED')
          return
        };

        if (event.data.type === 'EXTENSION_IS_NOT_INSTALLED') {
          onExtensionStatusResponse('EXTENSION_IS_NOT_INSTALLED')
          return
        };

        if (event.data.type === 'PROOFS_READY') {
          const { proofs, points } = event.data
          setProofs(proofs)
          setSelectedPoints(points)
          onExtensionStatusResponse('PROOFS_READY')
          // CLAIM READY
        };
        return;
      }

      console.warn("Blocked message from untrusted origin:", event.origin)
    });
  }, [])

  return <ThemeProvider theme={light}>
    <DialogStyled visible={visible} onClose={() => setVisible(false)}>
      <IFrame
        ref={iframeRef}
        src={`https://connect.bringid.org?url=${encodeURIComponent(window.location.href)}`}
        onLoad={iframeOnLoad}
      />
    </DialogStyled>
  </ThemeProvider>
}

export default ConnectDialog