'use client'
import { FC, useEffect, useRef } from 'react'
import { ThemeProvider } from 'styled-components'
import { light } from '@/themes'
import { Provider as ReduxProvider } from 'react-redux';
import store from './store';
// import WagmiProvider from './wagmi-provider'
import '../../fonts/index.css'
import { useDispatch } from 'react-redux'
import InnerModal from './inner-modal'
import { TProps } from './component-types'


export const VerificationsDialog: React.FC<TProps> = ({
  apiKey,
  address,
  generateSignature
}) => {
  // store instance persists for lifetime of this component

  return (
    <ThemeProvider theme={light}>
      <ReduxProvider store={store}>
        <InnerModal
          apiKey={apiKey}
          address={address}
          generateSignature={generateSignature}
        />
      </ReduxProvider>
    </ThemeProvider>
  );
};



export default VerificationsDialog