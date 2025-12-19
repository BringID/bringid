import {
  Container,
  TitleStyled,
  Header,
  Content,
  HeaderContent,
  SubtitleStyled,
  ArrowBackIconStyled,
  TextStyled,
  LinkStyled,
} from './styled-components';
import { FC } from 'react';
import { tasks } from '../../../../core/task';
import { TasksList } from '../../components';
import { useVerifications } from '../../store/reducers/verifications';
import { useUser } from '../../store/reducers/user';
import configs from '../../../../configs';
import { TProps } from './types'

const Tasks: FC<TProps> = ({
  setPage
}) => {
  const user = useUser()

  const availableTasks = tasks(true); // devmode
  const { verifications } = useVerifications();

  return (
    <Container>
      <Header>
        <ArrowBackIconStyled onClick={() => setPage('home')} />
        <HeaderContent>
          <TitleStyled>Add Verifications</TitleStyled>
          <SubtitleStyled>Connect accounts to build your score</SubtitleStyled>
        </HeaderContent>
      </Header>

      <Content>
        <TasksList tasks={availableTasks} verifications={verifications} />
      </Content>
      <TextStyled>
        No verifications available? Request new ones in our{' '}
        <LinkStyled target="_blank" href={configs.TELEGRAM_URL}>
          Telegram group
        </LinkStyled>
      </TextStyled>
    </Container>
  );
};

export default Tasks;
