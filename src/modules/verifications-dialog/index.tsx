'use client'
import { ThemeProvider } from 'styled-components'
import { light } from '@/themes'
import '../../fonts/index.css'
import { TProps } from './component-types'
import { useRef, useState, useEffect } from 'react'
import { useMessageProxy } from '@/hooks'
import {
  DialogStyled,
  IFrame,
  DialogClassName
} from './styled-components'
import { registerOpenModal } from './events/event-bus'
import { TSemaphoreProof } from '@/types'
import { createQueryString } from '@/utils'

let proofsGeneratedCallback: ((
  proofs: TSemaphoreProof[],
  points: number
) => void) | null = null

export const VerificationsDialog: React.FC<TProps> = ({
  apiKey,
  address,
  generateSignature,
  iframeOnLoad,
  scope,
  connectUrl = 'https://widget.bringid.org'
}) => {

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ visible, setVisible ] = useState<boolean>(false)

  useEffect(() => {
    registerOpenModal((
      args
    ) => {
      setVisible(true)
      console.log('registerOpenModal: ', {
        args
      })
      proofsGeneratedCallback = args.proofsGeneratedCallback
    });
  }, []);


  useMessageProxy(
    iframeRef,
    connectUrl,
    setVisible,
    proofsGeneratedCallback,
    generateSignature
  );

  const queryParams = createQueryString(
    {
      url: encodeURIComponent(window.location.href),
      apiKey,
      address,
      scope
    }
  )

  const iframeSrc =
    typeof window === "undefined"
      ? ""
      : `${connectUrl}?${queryParams}`

  return (
    <ThemeProvider theme={light}>
      <DialogStyled visible={visible} onClose={() => setVisible(false)} dialogClassName={DialogClassName}>
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