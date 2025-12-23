'use client'
import { FC, useEffect, useState } from 'react'
import {
  DialogStyled,
  Container,
  DialogWindowClassName
} from './styled-components'
import { TProps } from './types'
import { Home, Proofs } from '../pages'
import { useDispatch } from 'react-redux'
import {
  registerOpenModal,
  registerRequestProofs
} from '../events/event-bus';
import { setIsOpen, setLoading, useModal } from '../store/reducers/modal';
import { setAddress, setApiKey, useUser } from '../store/reducers/user';
import { TGenerateSignature, TVerification, TVerificationStatus } from '@/types';
import semaphore from '../semaphore';
import { Task, tasks } from '@/core';
import {
  addVerification,
  addVerifications,
  useVerifications
} from '../store/reducers/verifications';
import { ConfirmationOverlay, LoadingOverlay } from '../components'
import { registerRequest, openRequest, useRequestProofs, setScope } from '../store/reducers/request-proofs'
import { calculateAvailablePoints } from '@/utils'
import { setProofsGeneratedCallback, callProofsGeneratedCallback } from '../callbacks'


let resolveRequest: ((value: any) => void) | null = null;
let rejectRequest: ((reason?: any) => void) | null = null;

const defineContent = (
  page: string,
  setPage: (page: string) => void,
  closeModal: () => void,
  generateSignature?: TGenerateSignature,

) => {
  switch (page) {
    case 'home': return <Home
      setPage={setPage}
      generateSignature={generateSignature}
    />
    case 'proofs': return <Proofs
      onCancel={() => {
        setPage('home')
        closeModal()
      }}
      onConfirm={(proofs, pointsSelected) => {
        if (!callProofsGeneratedCallback) {
          return alert('proofsGeneratedCallback not passed')
        }

        callProofsGeneratedCallback(
          proofs,
          pointsSelected
        )
      }}
    />

    default: return <Home setPage={setPage} generateSignature={generateSignature} />
  }
}

const uploadPrevVerifications = async (
  tasks: Task[],
  userKey: string,
  setLoading: (
    loading: boolean
  ) => void,
  addVerification: (verification: TVerification) => void
) => {
  setLoading(true)
  for (const task of tasks) {
    for (const group of task.groups) {
      const identity = semaphore.createIdentity(
        String(userKey),
        group.credentialGroupId,
      );
      const { commitment } = identity;

      try {
        const proof = await semaphore.getProof(
          String(commitment),
          group.semaphoreGroupId,
        );
        if (proof) {
          const newTask = {
            credentialGroupId: group.credentialGroupId,
            status: 'completed' as TVerificationStatus,
            scheduledTime: +new Date(),
            fetched: true,
            taskId: task.id,
          }
          addVerification(newTask)
        }
      } catch (err) {
        console.log(`proof for ${commitment} was not added before`);
      }
    }
  }
  setLoading(false)
}

const InnerModal: FC<TProps> = ({
  apiKey,
  address,
  generateSignature
}) => {

  const dispatch = useDispatch()

  const { isOpen, loading } = useModal()

  const {
    isOpen: requestIsOpen,
    pointsRequired,
    scope
  } = useRequestProofs()

  const user = useUser()
  const { verifications } = useVerifications()

  useEffect(() => {
    registerOpenModal((
      args
    ) => {
      setPage('home');
      dispatch(openRequest(false));
      dispatch(setIsOpen(true))
      dispatch(setScope(args.scope || null))
      setProofsGeneratedCallback(args.proofsGeneratedCallback)
    });

    registerRequestProofs(async ({ pointsRequired, scope }) => {
      if (!user.key) {
        return alert('User key is not ready. Please sign in to BringID widget first')
      }
      dispatch(registerRequest(pointsRequired))
      dispatch(openRequest(true))
      dispatch(setIsOpen(true))

      dispatch(setScope(scope || null))
    
      return new Promise((resolve, reject) => {
        resolveRequest = resolve;
        rejectRequest = reject;
      });
    });

    return () => {
      resolveRequest = null;
      rejectRequest = null;
    };
  }, [
    user.key
  ]);


  useEffect(() => {
    if (!verifications) { return }

    const interval = setInterval(async () => {
      try {
        const notCompletedVerifications = verifications.filter(
          (verification) => verification.status !== 'completed',
        );
        if (notCompletedVerifications.length === 0) {
          return;
        }

        let updated = false

        const verificationsUpdated = verifications.map(item => {
          if (item.status !== 'completed') {
            const now = +new Date();
            const expiration = item.scheduledTime - now;
            if (expiration <= 0) {
              updated = true
              return {
                ...item,
                status: 'completed' as TVerificationStatus
              }
            }
          }
          return item
        })
        console.log({ verificationsUpdated })
        if (updated) dispatch(addVerifications(verificationsUpdated))

      } catch (err) {
        console.log({ err });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [verifications]);

  const availableTasks = tasks(true)

  const [ page, setPage ] = useState('home')

  useEffect(() => {
    if (address) dispatch(setAddress(address));
    if (apiKey) dispatch(setApiKey(apiKey));
  }, [
    apiKey,
    address
  ]);

  useEffect(() => {
    if (!user.key) return

    uploadPrevVerifications(
      availableTasks,
      user.key,
      (loading: boolean) => dispatch(setLoading(loading)),
      (verification) => dispatch(addVerification(verification))
    )

  }, [
    user.key
  ]);

  const availablePoints = calculateAvailablePoints(verifications, true)

  // return <WagmiProvider>
    return <Container>
      <DialogStyled
        dialogClassName={DialogWindowClassName}
        visible={isOpen}
        onClose={() => dispatch(setIsOpen(false))}
      >
        {requestIsOpen && pointsRequired && <ConfirmationOverlay
          pointsRequired={pointsRequired}
          scope={scope}
          points={availablePoints}
          onClose={() => {
            rejectRequest?.('User cancelled');
            rejectRequest = null;
            dispatch(openRequest(false));
          }}
          onAccept={(proofs) => {
            resolveRequest?.(proofs);
            resolveRequest = null;
            dispatch(openRequest(false));
            dispatch(setIsOpen(false))
          }}
        />}
        {loading && <LoadingOverlay title="Loading..."/>}
        {defineContent(
          page,
          setPage,
          () => {
            dispatch(setIsOpen(false))
          },
          generateSignature
        )}
      </DialogStyled>
    </Container>
}

export default InnerModal