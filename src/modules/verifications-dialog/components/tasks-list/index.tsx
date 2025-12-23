import React, { FC } from 'react';

import { Container } from './styled-components';
import { Task } from '@/components';
import TProps from './types';
import { defineRelatedVerification } from '@/utils';
import { useUser } from '../../store/reducers/user';

const TasksList: FC<TProps> = ({ tasks, className, verifications }) => {

  const user = useUser()
  return (
    <Container className={className}>
      {tasks.map((task, idx) => {
        const relatedVerification = defineRelatedVerification(
          task,
          verifications,
        );

        return (
          <Task
            key={task.id}
            status={relatedVerification?.status || 'default'}
            title={task.title}
            description={task.description}
            groups={task.groups}
            id={task.id}
            icon={task.icon}
            userKey={user.key as string}
          />
        );
      })}
    </Container>
  );
};

export default TasksList;
