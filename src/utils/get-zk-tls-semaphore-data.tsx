import { TVerificationData, TTask } from '../types'
import configs from '@/configs'
import { defineGroupByZKTLSResult } from './'
import { verifierApi } from '@/modules/verifications-dialog/api'

type TGetZKTLSSemaphoreData = (
  task: TTask,
  semaphoreIdentity: any,
  registry: string
) => Promise<
  TVerificationData
>

const getZKTLSSemaphoreData: TGetZKTLSSemaphoreData = (
  task,
  semaphoreIdentity,
  registry
) => {
  

  return new Promise((resolve, reject) => {
    const handler = async (event: MessageEvent) => {
      console.log({ event, AUTH_DOMAIN: configs.AUTH_DOMAIN })
      if (event.origin !== configs.AUTH_DOMAIN) return

      if (event.data?.type === "VERIFICATION_DATA_READY") {
        const {
          transcriptRecv,
          presentationData
        } = event.data.payload

        const groupData = defineGroupByZKTLSResult(
          transcriptRecv as string,
          task.groups
        )

        if (groupData) {
          const { credentialGroupId, semaphoreGroupId } = groupData

          // GET VERIFICATION
          const verify = await verifierApi.verify(
            configs.ZUPLO_API_URL,
            presentationData,
            registry,
            credentialGroupId,
            String(semaphoreIdentity.commitment)
          )

          const {
            signature,
            verifier_hash,
            verifier_message: {
              id_hash
            }
          } = verify

          window.removeEventListener("message", handler)
          resolve({
            signature,
            verifier_hash,
            verifier_message: {
              id_hash
            }
          })
        }
      }

      if (event.data?.type === "VERIFICATION_DATA_ERROR") {
        window.removeEventListener("message", handler)
        reject(event.data.error)
      }
    }

    window.addEventListener("message", handler)
  })

  
};

export default getZKTLSSemaphoreData
