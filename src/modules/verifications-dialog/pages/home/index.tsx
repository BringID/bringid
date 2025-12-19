'use client'

import { FC } from 'react';
import { Container, VerificationsListStyled } from './styled-components';
import { Header } from '../../components';
import { useVerifications } from '../../store/reducers/verifications';
import { Task, tasks } from '../../../../core/task';
import {
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
  setPage: (page: string) => void,
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
        setPage('tasks');
      }}
    />
  );
};

const Home: FC<TProps> = ({
  generateSignature,
  setPage
}) => {
  const verificationsStore = useVerifications();
  const { verifications, loading } = verificationsStore;
  const user = useUser();


  const availableTasks = tasks(true); //devMode


  const availablePoints = calculateAvailablePoints(verifications, true); //devMode

  return (
    <Container>
      {loading && <LoadingOverlay title="Processing verification..." />}
      <Header
        points={availablePoints}
        address={user.address}
        userKey={user.key}
      />

      {renderContent(user.key, availableTasks, verifications, true, setPage, generateSignature)} 
      {/* devMode is false */}
    </Container>
  );
};

export default Home;
