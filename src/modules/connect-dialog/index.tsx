'use client'
import { FC, useRef } from 'react'
import {
  DialogStyled,
  IFrame
} from './styled-components'
import { TProps } from './types'
import { ThemeProvider } from 'styled-components'
import { light } from '@/themes'
import { useMessageProxy } from '@/hooks'

const ConnectDialog: FC<TProps> = ({
  visible,
  setVisible,
  iframeOnLoad,
  onLogin,
  onLogout,
  connectUrl = 'https://connect.bringid.org'
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useMessageProxy(
    iframeRef,
    connectUrl,
    onLogin,
    onLogout,
  );

  const iframeSrc =
    typeof window === "undefined"
      ? ""
      : `${connectUrl}?url=${encodeURIComponent(
          window.location.href
        )}`;


  return <ThemeProvider theme={light}>
    <DialogStyled visible={visible} onClose={() => setVisible(false)}>
      <IFrame
        ref={iframeRef}
        src={iframeSrc}
        onLoad={iframeOnLoad}
      />
    </DialogStyled>
  </ThemeProvider>
}

export default ConnectDialog