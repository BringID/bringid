'use client'

import {
  FC,
} from 'react'
import {
  DialogWrapper,
  Dialog
} from './styled-components'
import { TProps } from './types'

const DialogComponent: FC<TProps> = ({
  children,
  className,
  dialogClassName
}) => {
  return (
    <DialogWrapper
      className={className}
    >
      <Dialog className={dialogClassName}>
        {children}
      </Dialog>
    </DialogWrapper>
  )
}

export default DialogComponent
