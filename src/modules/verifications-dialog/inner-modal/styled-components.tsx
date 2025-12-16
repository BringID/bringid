import styled, { css } from "styled-components"
import { Dialog } from '@/components'

export const DialogWindowClassName = 'DialogWindowClassName'

export const DialogStyled = styled(Dialog)<{
  visible: boolean
}>`
  ${props => !props.visible && css`
    opacity: 0;
    pointer-events: none;
  `}
`

export const Container = styled.div`
  .${DialogWindowClassName} {
    width: 480px;
    height: 600px;
  }
`