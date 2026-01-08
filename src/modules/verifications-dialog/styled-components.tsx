import styled, { css } from "styled-components"
import { Dialog } from '@/components'

export const DialogStyled = styled(Dialog)<{
  visible?: boolean
}>`
  ${props => !props.visible && css`
    opacity: 0;
    pointer-events: none;
  `}
`

export const IFrame = styled.iframe`
  width: 100%;
  height: 500px;
  border: none;
  overflow: auto;
`