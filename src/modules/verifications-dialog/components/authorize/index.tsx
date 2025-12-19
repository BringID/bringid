import React, { FC } from 'react';
import TProps from './types';
import { Container, Title, ButtonsStyled } from './styled-components';
import { useDispatch } from 'react-redux';
import { setKey } from '../../store/reducers/user';

const Authorize: FC<TProps> = ({ className, generateSignature }) => {
  const dispatch = useDispatch()
  
  return (
    <Container className={className}>
      <Title>Connect your wallet to start verifying</Title>

      <ButtonsStyled
        onClick={async() => {
          if (!generateSignature) {
            alert('generateSignature method is not passed')
            return
          }
          const sig = await generateSignature(`Sign to derive your BringID key.
Recoverable by re-signing with the same wallet.`)
          console.log({ sig })
          dispatch(setKey(sig))
        }}
      >
        Create BringID key
      </ButtonsStyled>
    </Container>
  );
};

export default Authorize;
