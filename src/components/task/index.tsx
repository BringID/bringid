import React, { FC } from 'react'
import { TProps } from './types'
import { Value } from './styled-components'
import { TaskContainer } from '../../components'
import Button from '../button'
import configs from '../../configs'
import { Icons, Tag } from '../../components'
import { TTask, TVerification, TVerificationStatus } from '@/types'
import { createQueryString, createSemaphoreIdentity, defineTaskPointsRange, getOAuthSemaphoreData } from '@/utils'
import getConfigs from '@/configs/mode-configs'
import { tasks } from '@/core'
import { taskManagerApi } from '@/modules/verifications-dialog/api'
import { addVerification } from '@/modules/verifications-dialog/store/reducers/verifications'
import { useDispatch } from 'react-redux'
import { setLoading } from '@/modules/verifications-dialog/store/reducers/modal'


const defineTaskContent = (
  status: TVerificationStatus,
  task: TTask,
  userKey: string | null,
  resultCallback: (verification: TVerification) => void
) => {
  switch (status) {
    case 'default':
      const points = defineTaskPointsRange(task.groups);
      return (
        <>
          <Tag status="info">+{points}</Tag>
          <Button
            appearance="action"
            size="small"
            onClick={async () => {
              try {


                const modeConfigs = await getConfigs()
                const group = task?.groups[0]


                if (group) {

                  const semaphoreIdentity = createSemaphoreIdentity(userKey as string, group?.credentialGroupId)

                  const {
                    signature,
                    verifier_hash,
                    verifier_message: {
                      id_hash
                    }
                  } = task.oauthUrl ? await getOAuthSemaphoreData(
                    task,
                    group,
                    semaphoreIdentity,
                    modeConfigs.REGISTRY
                  ) : await getOAuthSemaphoreData(
                    task,
                    group,
                    semaphoreIdentity,
                    modeConfigs.REGISTRY
                  ) 

                  const { task: taskCreated, success } = await taskManagerApi.addVerification(
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
                      scheduledTime: taskCreated.scheduled_time,
                      taskId: taskCreated.id,
                      credentialGroupId: group?.credentialGroupId,
                      fetched: false
                    })
                  }

                  console.log({ taskCreated })
                
                  
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
  status,
  userKey,
  task
}) => {

  const dispatch = useDispatch()

  const content = defineTaskContent(
    status,
    task,
    userKey,
    (verification) => {
      console.log('IS GOINT TO BE ADD: ', { verification })
      dispatch(addVerification(verification))
    }
  );

  return (
    <TaskContainer
      status={status}
      selectable={false}
      task={task}
    >
      <Value>{content}</Value>
    </TaskContainer>
  );
};

export default Task;
