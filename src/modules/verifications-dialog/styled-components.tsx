import styled, { css } from "styled-components"
import { Dialog } from '@/components'

export const DialogClassName = "DialogClassName"

export const DialogStyled = styled(Dialog)<{
  visible?: boolean
}>`
  ${props => !props.visible && css`
    opacity: 0;
    pointer-events: none;
  `}

  &.${DialogClassName} {
    max-width: 400px;
    padding: 0px;
    overflow: hidden;
  }
`

export const IFrame = styled.iframe`
  width: 100%;
  height: 500px;
  border: none;
  overflow: auto;
`