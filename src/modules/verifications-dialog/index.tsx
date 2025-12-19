'use client'
import { ThemeProvider } from 'styled-components'
import { light } from '@/themes'
import { Provider as ReduxProvider } from 'react-redux';
import store from './store';
import '../../fonts/index.css'
import InnerModal from './inner-modal'
import { TProps } from './component-types'


export const VerificationsDialog: React.FC<TProps> = ({
  apiKey,
  address,
  generateSignature
}) => {
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