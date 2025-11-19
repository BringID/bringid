'use client'

import React,
{
  FC,
  UIEvent
} from 'react'
import {
  DialogWrapper,
  Dialog,
  DialogTitle,
  IconWrapper,
  CloseButtonStyled
} from './styled-components'
import { TProps } from './types'

const DialogComponent: FC<TProps> = ({
  title,
  onClose,
  children,
  className,
  dialogClassName,
  icon
}) => {

  const onClick = (e: UIEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    const currentTarget = e.currentTarget as HTMLElement
    if (target === currentTarget) {
      onClose && onClose()
    }
  }

  return (
    <DialogWrapper
      onClick={onClick}
      className={className}
    >
      <Dialog className={dialogClassName}>
        <CloseButtonStyled onClick={onClose}/>
        {icon && <IconWrapper>
          {icon}  
        </IconWrapper>}
        {title && <DialogTitle>{title}</DialogTitle>}
        {children}
      </Dialog>
    </DialogWrapper>
  )
}

export default DialogComponent
