import React, { FC } from 'react';
import { TProps } from './types';
import { Value } from './styled-components';
import { TaskContainer } from '../../components';
import Button from '../button';
import configs from '../../configs';
import { Icons, Tag } from '../../components';
import { TNotarizationGroup, TVerificationStatus } from '@/types';
import { createQueryString, createSemaphoreIdentity, defineGroup, defineTaskPointsRange } from '@/utils';
import getConfigs from '@/configs/mode-configs';
import { tasks } from '@/core';

const defineTaskContent = (
  status: TVerificationStatus,
  groups: TNotarizationGroup[],
  taskId: string,
  userKey: string
) => {
  switch (status) {
    case 'default':
      const points = defineTaskPointsRange(groups);
      return (
        <>
          <Tag status="info">+{points}</Tag>
          <Button
            appearance="action"
            size="small"
            onClick={async () => {
              try {


                const modeConfigs = await getConfigs()
                const availableTasks = tasks(false)
                const task = availableTasks.find(task => task.id === taskId)
                const group = task?.groups[0]


                if (group) {
                  const semaphoreIdentity = createSemaphoreIdentity(userKey, group?.credentialGroupId)

                  const statePayload = {
                    registry: modeConfigs.REGISTRY,
                    credential_group_id: group?.credentialGroupId,
                    semaphore_identity_commitment: String(semaphoreIdentity.commitment),
                    origin: window.location.origin
                  }

                  const queryParams = createQueryString({
                    state: btoa(JSON.stringify(statePayload))
                  })

                  const popup = window.open(
                    `${configs.AUTH_DOMAIN}/auth/github/login?${queryParams}`,
                    "oauth",
                    "width=400,height=600,popup=yes"
                  )

                  if (!popup) {
                    throw new Error("Popup blocked")
                  }

                  const handler = (event: MessageEvent) => {
                    if (event.origin !== configs.AUTH_DOMAIN) return

                    if (event.data?.type === "AUTH_SUCCESS") {
                      console.log({
                        event
                      })
                      window.removeEventListener("message", handler)
                    }

                    if (event.data?.type === "AUTH_ERROR") {
                      window.removeEventListener("message", handler)
                      throw new Error(event.data.error)
                    }
                  }

                  window.addEventListener("message", handler)
                }
                
              } catch (err) {
                alert(err.message)
              }
            }}
          >
            Verify
          </Button>
        </>
      );
    case 'pending':
    case 'scheduled':
      return <Icons.Clock />;

    default:
      return <Icons.Check />;
  }
};

const Task: FC<TProps> = ({
  title,
  groups,
  icon,
  description,
  status,
  id,
  userKey
}) => {

  const content = defineTaskContent(
    status,
    groups,
    id,
    userKey
  );

  return (
    <TaskContainer
      status={status}
      selectable={false}
      title={title}
      description={description}
      icon={icon}
      id={id}
      groups={groups}
    >
      <Value>{content}</Value>
    </TaskContainer>
  );
};

export default Task;
