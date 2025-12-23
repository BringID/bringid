import React, { FC } from 'react';
import { TProps } from './types';
import { Value } from './styled-components';
import { TaskContainer } from '../../components';
import Button from '../button';
import configs from '../../configs';
import { Icons, Tag } from '../../components';
import { TNotarizationGroup, TVerification, TVerificationStatus } from '@/types';
import { createQueryString, createSemaphoreIdentity, defineTaskPointsRange } from '@/utils';
import getConfigs from '@/configs/mode-configs';
import { tasks } from '@/core';
import { taskManagerApi } from '@/modules/verifications-dialog/api';
import { addVerification } from '@/modules/verifications-dialog/store/reducers/verifications';
import { useDispatch } from 'react-redux';
import { setLoading } from '@/modules/verifications-dialog/store/reducers/modal';

const defineTaskContent = (
  status: TVerificationStatus,
  groups: TNotarizationGroup[],
  taskId: string,
  userKey: string | null,
  resultCallback: (verification: TVerification) => void
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
                const availableTasks = tasks(true)
                const task = availableTasks.find(task => task.id === taskId)
                const group = task?.groups[0]


                if (group) {
                  const semaphoreIdentity = createSemaphoreIdentity(userKey as string, group?.credentialGroupId)

                  const statePayload = {
                    registry: modeConfigs.REGISTRY,
                    credential_group_id: group?.credentialGroupId,
                    semaphore_identity_commitment: String(semaphoreIdentity.commitment),
                    origin: window.location.origin
                  }

                  const queryParams = createQueryString({
                    state: btoa(JSON.stringify(statePayload))
                  })

                  setLoading(true)

                  const popup = window.open(
                    `${configs.AUTH_DOMAIN}/auth/github/login?${queryParams}`,
                    "oauth",
                    "width=400,height=600,popup=yes"
                  )

                  if (!popup) {
                    setLoading(false)
                    throw new Error("Popup blocked")
                  }

                  const handler = async (event: MessageEvent) => {
                    console.log({ event, AUTH_DOMAIN: configs.AUTH_DOMAIN })
                    if (event.origin !== configs.AUTH_DOMAIN) return

                    if (event.data?.type === "AUTH_SUCCESS") {
                      const {
                        signature,
                        verifier_hash,
                        verifier_message: {
                          id_hash
                        }
                      } = event.data.payload
                      window.removeEventListener("message", handler)

                      const { task, success } = await taskManagerApi.addVerification(
                        configs.ZUPLO_API_URL,
                        modeConfigs.REGISTRY,
                        group?.credentialGroupId,
                        id_hash,
                        String(semaphoreIdentity.commitment),
                        signature
                      )

                      if (success) {
                        setLoading(false)
                        resultCallback({
                          status: 'scheduled',
                          scheduledTime: task.scheduled_time,
                          taskId: task.id,
                          credentialGroupId: group?.credentialGroupId,
                          fetched: false
                        })
                      }

                      console.log({ task })
                    }

                    if (event.data?.type === "AUTH_ERROR") {
                      setLoading(false)
                      window.removeEventListener("message", handler)
                      throw new Error(event.data.error)
                    }
                  }

                  window.addEventListener("message", handler)
                }
              } catch (err) {
                setLoading(false)
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

  const dispatch = useDispatch()

  const content = defineTaskContent(
    status,
    groups,
    id,
    userKey,
    (verification) => dispatch(addVerification(verification))
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
