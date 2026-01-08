'use client'
import { ThemeProvider } from 'styled-components'
import { light } from '@/themes'
import '../../fonts/index.css'
import { TProps } from './component-types'
import { useRef } from 'react'
import { useMessageProxy } from '@/hooks'
import {
  DialogStyled,
  IFrame
} from './styled-components'

export const VerificationsDialog: React.FC<TProps> = ({
  apiKey,
  address,
  generateSignature,
  iframeOnLoad,
  connectUrl = 'https://widget.bringid.org',
  visible,
  setVisible
}) => {

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useMessageProxy(
    iframeRef,
    connectUrl,
    setVisible,
    generateSignature
  );

  const iframeSrc =
    typeof window === "undefined"
      ? ""
      : `${connectUrl}?url=${encodeURIComponent(window.location.href)}&apiKey=${apiKey}&address=${address}`

  return (
    <ThemeProvider theme={light}>
      <DialogStyled visible={visible} onClose={() => setVisible(false)}>
        <IFrame
          ref={iframeRef}
          src={iframeSrc}
          onLoad={iframeOnLoad}
        />
      </DialogStyled>
    </ThemeProvider>
  )
}



export default VerificationsDialog