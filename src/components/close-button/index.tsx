import { FC } from 'react'
import { Container } from './styled-components'
import Icons from '@/components/icons'
import TProps from './types'

const CloseButton: FC<TProps> = ({
  className,
  onClick
}) => {
  return <Container className={className} onClick={onClick}>
    <Icons.CloseIcon />
  </Container>
}

export default CloseButton