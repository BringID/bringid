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

  .${DialogClassName} {
    max-width: 400px;
    width: 90%;
    padding: 0px;
    position: relative;
    overflow: hidden;
  }
`

export const IFrame = styled.iframe`
  width: 100%;
  height: 550px;
  border: none;
  overflow: auto;
`

export const LoadingScreen = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
`