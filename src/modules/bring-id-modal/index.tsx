'use client'
import { ThemeProvider } from 'styled-components'
import { light } from '@/themes'
import '../../fonts/index.css'
import { TProps } from './component-types'
import { useRef, useState } from 'react'
import { useMessageProxy } from '@/hooks'
import {
  DialogStyled,
  IFrame,
  DialogClassName,
  LoadingScreen
} from './styled-components'
import { createQueryString } from '@/utils'
import { Spinner } from '@/components'
import ALLOWED_CONNECT_DOMAINS from '@/configs/allowed-connect-domains'

export const BringIDModal: React.FC<TProps> = ({
  address,
  generateSignature,
  iframeOnLoad,
  mode = 'production',
  highlightColor,
  theme = 'light',
  connectUrl = 'https://widget.bringid.org'
}) => {

  if (!ALLOWED_CONNECT_DOMAINS.includes(connectUrl)) {
    console.error(`BringID: Invalid connectUrl "${connectUrl}". Must be one of: ${ALLOWED_CONNECT_DOMAINS.join(', ')}`)
    return null
  }

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ isReady, setIsReady ] = useState<boolean>(false)

  useMessageProxy(
    isReady,
    iframeRef,
    connectUrl,
    setVisible,
    generateSignature
  );

  if (typeof window === "undefined") {
    return null
  }
  

  const queryParams = createQueryString(
    {
      url: encodeURIComponent(window.location.href),
      address,
      mode,
      theme,
      highlightColor: highlightColor ? encodeURIComponent(highlightColor) : undefined
    }
  )

  const iframeSrc =
    typeof window === "undefined"
      ? ""
      : `${connectUrl}?${queryParams}`

  return (
    <ThemeProvider theme={light}>
      <DialogStyled visible={visible} onClose={() => setVisible(false)} dialogClassName={DialogClassName}>
        {!isReady && <LoadingScreen>
          <Spinner size='large' />
        </LoadingScreen>}
        <IFrame
          sandbox="allow-scripts allow-same-origin allow-forms"
          ref={iframeRef}
          src={iframeSrc}
          onLoad={() => {
            iframeOnLoad && iframeOnLoad()
            setIsReady(true)
          }}
        />
      </DialogStyled>
    </ThemeProvider>
  )
}



export default BringIDModal