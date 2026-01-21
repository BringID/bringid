import { FC } from 'react'
import { Container } from './styled-components'
import TProps from './types'
import CloseIcon from './close-icon'

const CloseButton: FC<TProps> = ({
  className,
  onClick
}) => {
  return <Container className={className} onClick={onClick}>
    <CloseIcon />
  </Container>
}

export default CloseButton