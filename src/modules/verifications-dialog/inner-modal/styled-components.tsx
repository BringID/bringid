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
    position: relative;
    width: 400px;
    padding: 8px;
    border-radius: 8px;
    height: 600px;
  }
`