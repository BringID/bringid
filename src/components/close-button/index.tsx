import { FC } from 'react'
import { Container } from './styled-components'
import {
  CloseIcon
} from '@/components/icons'
import TProps from './types'

const CloseButton: FC<TProps> = ({
  className,
  onClick
}) => {
  return <Container className={className} onClick={onClick}>
    <CloseIcon />
  </Container>
}

export default CloseButton