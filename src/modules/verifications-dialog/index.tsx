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
  DialogClassName,
  LoadingScreen
} from './styled-components'
import { registerOpenModal } from './events/event-bus'
import { TSemaphoreProof } from '@/types'
import { createQueryString } from '@/utils'
import { Spinner } from '@/components'

let proofsGeneratedCallback: ((
  proofs: TSemaphoreProof[],
  points: number
) => void) | null = null

export const VerificationsDialog: React.FC<TProps> = ({
  apiKey,
  address,
  generateSignature,
  iframeOnLoad,
  mode = 'production',
  connectUrl = 'https://widget.bringid.org'
}) => {

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ visible, setVisible ] = useState<boolean>(false)

  useEffect(() => {
    registerOpenModal((
      args
    ) => {
      setVisible(true)
      proofsGeneratedCallback = args.proofsGeneratedCallback

      iframeRef.current && iframeRef.current.contentWindow?.postMessage(
        {
          type: 'CURRENT_SCOPE_READY',
          payload: {
            scope: args.scope
          }
        },
        connectUrl
      )

    });
  }, []);

  useMessageProxy(
    iframeRef,
    connectUrl,
    setVisible,
    proofsGeneratedCallback,
    generateSignature
  );

  const [ loading, setLoading ] = useState<boolean>(true)

  const queryParams = createQueryString(
    {
      url: encodeURIComponent(window.location.href),
      apiKey,
      address,
      mode
    }
  )

  const iframeSrc =
    typeof window === "undefined"
      ? ""
      : `${connectUrl}?${queryParams}`

  return (
    <ThemeProvider theme={light}>
      <DialogStyled visible={visible} onClose={() => setVisible(false)} dialogClassName={DialogClassName}>
        {loading && <LoadingScreen>
          <Spinner size='large' />
        </LoadingScreen>}
        <IFrame
          ref={iframeRef}
          src={iframeSrc}
          onLoad={() => {
            iframeOnLoad && iframeOnLoad()
            setLoading(false)
          }}
        />
      </DialogStyled>
    </ThemeProvider>
  )
}



export default VerificationsDialog