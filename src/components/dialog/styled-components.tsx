import styled from 'styled-components'
import CloseButton from '../close-button'

export const DialogWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  box-sizing: border-box;
`

export const Dialog = styled.div`
  max-width: 680px;
  position: relative;
  width: 100%;
  background: ${(props) => (props.theme && props.theme.widgetBackgroundColor)};
  border-radius: 20px;
  border: 1px solid ${(props) => (props.theme && props.theme.primaryBorderColor)};
  padding: 16px;

  @media (max-width: ${props => props.theme.mobileBreakpoint}) {
    padding: 40px 25px;
  }
`

export const DialogTitle = styled.h3`
  margin: 0 0 20px;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: ${props => props.theme.primaryTextColor};
`

export const IconWrapper = styled.div`
  margin: 0 auto 20px;
  display: flex;
  justify-content: center;
`

export const CloseButtonStyled = styled(CloseButton)`
  position: absolute;
  right: 20px;
  top: 20px;
`