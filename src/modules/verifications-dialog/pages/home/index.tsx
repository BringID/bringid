'use client'

import { FC, useState, useEffect } from 'react';
import { Container, VerificationsListStyled } from './styled-components';
import { Header } from '../../components';
import { useNavigate } from 'react-router';
import { useVerifications } from '../../store/reducers/verifications';
import { Task, tasks } from '../../../../core/task';
import {
  ConfirmationOverlay,
  LoadingOverlay,
  Authorize,
} from '../../components';
import { calculateAvailablePoints } from '@/utils';
import { useUser } from '../../store/reducers/user';
import { TVerification } from '@/types';
import { TProps } from './types'

const renderContent = (
  userKey: string | null,
  availableTasks: Task[],
  verifications: TVerification[],
  devMode: boolean,
  navigate: (location: string) => void,
  generateSignature?: (msg: string) => Promise<string>
) => {
  if (!userKey) {
    return <Authorize
      generateSignature={generateSignature}
    />
  }

  return (
    <VerificationsListStyled
      tasks={availableTasks}
      devMode={devMode}
      verifications={verifications}
      onAddVerifications={() => {
        navigate('/tasks');
      }}
    />
  );
};

const Home: FC<TProps> = ({
  generateSignature
}) => {
  const verificationsStore = useVerifications();
  const { verifications, loading } = verificationsStore;
  const user = useUser();

  const availableTasks = tasks(false); //devMode

  const [confirmationOverlayShow, setConfirmationOverlayShow] =
    useState<boolean>(false);
  const [requestHost, setRequestHost] = useState<string>('');
  const [pointsRequired, setPointsRequired] = useState<string>('');
  const [dropAddress, setDropAddress] = useState<string>('');

  const availablePoints = calculateAvailablePoints(verifications, false); //devMode

  const navigate = useNavigate();

  useEffect(() => {
    // CHECK IF PROOFS REQUEST CALLED
  }, []);

  const onRequestClose = () => {
    setDropAddress('');
    setPointsRequired('');
    setRequestHost('');
    setConfirmationOverlayShow(false);
  };

  return (
    <Container>
      {loading && <LoadingOverlay title="Processing verification..." />}
      {confirmationOverlayShow && (
        <ConfirmationOverlay
          onClose={() => {
            onRequestClose();
          }}
          host={requestHost}
          points={availablePoints}
          pointsRequired={Number(pointsRequired)}
          dropAddress={dropAddress}
        />
      )}
      <Header points={availablePoints} address={user.address} />

      {renderContent(user.key, availableTasks, verifications, false, navigate, generateSignature)} 
      {/* devMode is false */}
    </Container>
  );
};

export default Home;
