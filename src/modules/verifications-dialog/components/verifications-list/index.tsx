import React, { FC } from 'react';

import {
  Container,
  ButtonStyled,
  NoteStyled,
  LinkStyled,
} from './styled-components';
import { Task, Verification } from '@/components';
import TProps from './types';
import NoVerificationsFound from '../no-verifications-found';
import { defineRelatedVerification, defineTaskByCredentialGroupId } from '@/utils';
import { useUser } from '../../store/reducers/user';

const VerificationsList: FC<TProps> = ({
  verifications,
  onAddVerifications,
  className,
  devMode,
  tasks
}) => {

  const user = useUser()
  const hasAnyPendingVerification = verifications.find(
    (verification) =>
      verification.status === 'scheduled' || verification.status === 'pending',
  );

  return (
    <Container className={className}>
      {hasAnyPendingVerification && (
        <NoteStyled>
          We batch verifications for better privacy.{' '}
          <LinkStyled href="https://bringid.org/privacy-policy" target="_blank">
            Learn more
          </LinkStyled>
        </NoteStyled>
      )}
      {/* {verifications.length === 0 && (
        <NoVerificationsFound title="No verifications yet" />
      )} */}
      {
        tasks.map((task) => {
          const relatedVerification = defineRelatedVerification(
            task,
            verifications
          )

          if (relatedVerification) {
             const relatedTaskData = defineTaskByCredentialGroupId(
              relatedVerification.credentialGroupId,
              devMode //devmode
            )

            if (relatedTaskData) {
              return (
                <Verification
                  fetched={relatedVerification.fetched}
                  key={relatedVerification.taskId}
                  title={task.title}
                  description={task.description}
                  taskId={relatedVerification.taskId}
                  points={relatedTaskData.group.points}
                  scheduledTime={relatedVerification.scheduledTime}
                  status={relatedVerification.status}
                  selectable={false}
                  icon={relatedTaskData.icon}
                  credentialGroupId={relatedVerification.credentialGroupId}
                />
              );
            }
          } else {
            // here render task, not verification
            return (
              <Task
                key={task.id}
                title={task.title}
                description={task.description}
                groups={task.groups}
                status='default'
                icon={task.icon}
                id={task.id}
                userKey={user.key}
              />
            );
          }
        })}
      {/* <ButtonStyled onClick={onAddVerifications} appearance="action">
        Add verifications
      </ButtonStyled> */}
    </Container>
  );
};

export default VerificationsList;
