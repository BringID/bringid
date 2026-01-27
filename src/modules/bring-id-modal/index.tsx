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

export const BringIDModal: React.FC<TProps> = ({
  apiKey,
  address,
  generateSignature,
  iframeOnLoad,
  mode = 'production',
  highlightColor,
  theme = 'light',
  connectUrl = 'https://widget.bringid.org'
}) => {

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ isReady, setIsReady ] = useState<boolean>(false)

  if (typeof window === "undefined") {
    return null
  }

  useMessageProxy(
    isReady,
    iframeRef,
    connectUrl,
    setVisible,
    generateSignature
  );


  const queryParams = createQueryString(
    {
      url: encodeURIComponent(window.location.href),
      apiKey,
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