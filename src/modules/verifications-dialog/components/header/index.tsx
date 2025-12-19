import React, { FC } from 'react';
import {
  Header,
  TextStyled,
  ButtonStyled,
  AddressText,
  TitleStyled,
  Content,
  Texts,
  Address,
} from './styled-components';
import TProps from './types';
import { shortenString } from '@/utils';
import AddressIcon from '@/components/icons/address';
import { addVerifications } from '../../store/reducers/verifications';
import { destroy } from '../../store/reducers/user';
import { useDispatch } from 'react-redux';

const defineContent = (
  address: string | null,
  points: number,
  userKey: string | null
) => {

  const dispatch = useDispatch()

  if (!address || !userKey) {
    return <TitleStyled>BringID</TitleStyled>
  }


  return (
    <Content>
      <Texts>
        <Address>
          <AddressIcon /> <AddressText>{shortenString(address)}</AddressText>
        </Address>
        <TextStyled>Total Bring Score: {points}</TextStyled>
      </Texts>
      <ButtonStyled
        onClick={async () => {
          dispatch(addVerifications([]))
          dispatch(destroy())
        }}
      >
        Logout
      </ButtonStyled>
    </Content>
  );
};

const HeaderComponent: FC<TProps> = ({
  points,
  address,
  userKey
}) => {
  return <Header>{defineContent(
    address,
    points,
    userKey
  )}</Header>;
};

export default HeaderComponent;
