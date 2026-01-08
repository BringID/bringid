import { FC } from 'react'
import { Container } from './styled-components'
import TProps from './types'

const CloseButton: FC<TProps> = ({
  className,
  onClick
}) => {
  return <Container className={className} onClick={onClick}>
    X
  </Container>
}

export default CloseButton