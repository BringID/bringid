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

      {generateSignature && <ButtonsStyled
        onClick={async() => {
          const sig = await generateSignature('Hello world')
          dispatch(setKey(sig))
        }}
      >
        GENERATE SIGNATURE  
      </ButtonsStyled>}
    </Container>
  );
};

export default Authorize;
