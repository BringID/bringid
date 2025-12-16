'use client'
import { FC, useEffect } from 'react'
import {
  DialogStyled,
  Container,
  DialogWindowClassName
} from './styled-components'
import { TProps } from './types'
import { Navigate, Route, Routes } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { Home, Tasks } from '../pages'
// import WagmiProvider from './wagmi-provider'
import { useDispatch } from 'react-redux'
import { registerOpenModal } from '../events/event-bus';
import { useModal } from '../store/reducers/modal';
import { setAddress, setApiKey } from '../store/reducers/user';

const InnerModal: FC<TProps> = ({
  apiKey,
  address,
  generateSignature
}) => {

  const dispatch = useDispatch()

  const { isOpen } = useModal()

  useEffect(() => {
    registerOpenModal(() => {
      dispatch({ type: '/modal/setIsOpen', payload: true });
    });
  }, []);

  useEffect(() => {
    if (address) dispatch(setAddress(address));
    if (apiKey) dispatch(setApiKey(apiKey));
  }, [ apiKey, address ]);

  console.log({ isOpen })

  // return <WagmiProvider>
    return <Container>
      <DialogStyled
        dialogClassName={DialogWindowClassName}
        visible={isOpen}
        onClose={() => dispatch({ type: '/modal/setIsOpen', payload: false })}
      >
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home
              generateSignature={generateSignature}
            />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </DialogStyled>
    </Container>
}

export default InnerModal