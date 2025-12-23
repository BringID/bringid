import React, { FC, useState, useMemo, useEffect } from 'react';
import {
  Container,
  LogoWrapperStyled,
  TitleStyled,
  Content,
  ButtonsContainer,
  MessageStyled,
  TextStyled,
  Image,
  ButtonStyled,
  NoteStyled,
  OpenPopupButton,
  VerificationsSelectListStyled,
} from './styled-components';
import TProps from './types';
import { useVerifications } from '../../store/reducers/verifications';
import {
  defineTaskByCredentialGroupId,
} from '@/utils';
import { TSemaphoreProof, TVerification } from '@/types';
import { Tag } from '@/components';
import BringGif from '../../images/bring.gif';
import { tasks } from '@/core';
import { useUser } from '../../store/reducers/user';
import { prepareProofs } from '../../utils';
import { defineInitialSelectedVerifications } from '@/utils';

const defineIfButtonIsDisabled = (
  pointsRequired: number,
  pointsSelected: number,
) => {
  if (pointsRequired > pointsSelected) {
    return true;
  }
};

const showInsufficientPointsNote = (
  isEnoughPoints: boolean,
  pointsRequired: number,
  points: number,
  onClose: () => void,
) => {
  if (isEnoughPoints) return null;

  return (
    <NoteStyled title="Insufficient trust level" status="warning">
      You need {pointsRequired - points} more points.{' '}
      <OpenPopupButton
        onClick={async () => {
          onClose();
        }}
      >
        Complete verifications
      </OpenPopupButton>{' '}
      to increase your trust score.
    </NoteStyled>
  );
};

const showInsufficientPointsMessage = (
  isEnoughPoints: boolean,
  pointsRequired: number,
) => {
  if (isEnoughPoints) return null;
  return (
    <MessageStyled status="error">
      <span>Required:</span>
      <Tag status="error">{pointsRequired} pts</Tag>
    </MessageStyled>
  );
};

const defineButton = (
  userKey: string | null,
  verifications: TVerification[],
  isEnoughPoints: boolean,
  pointsRequired: number,
  pointsSelected: number,
  scope: string | null,
  loading: boolean,
  setLoading: (loading: boolean) => void,
  selected: string[],
  onClose: () => void,
  onAccept: (
    proofs: TSemaphoreProof[]
  ) => void
) => {
  if (isEnoughPoints) {
    return (
      <ButtonStyled
        loading={loading}
        size="default"
        disabled={defineIfButtonIsDisabled(pointsRequired, pointsSelected)}
        appearance="action"
        onClick={async () => {
          setLoading(true);
          try {

            if (!userKey) {
              alert('USER HAS NO KEY')
              throw new Error('USER HAS NO KEY')
            }
            const proofs = await prepareProofs(
              userKey,
              verifications,
              scope,
              pointsSelected,
              selected,
            );

            onAccept(proofs)

            onClose();
          } catch (err) {
            setLoading(false);
            console.log({ err });
          }
          setLoading(false);
        }}
      >
        Confirm ({pointsSelected} pts)
      </ButtonStyled>
    );
  }

  return (
    <ButtonStyled onClick={onClose} appearance="action">
      Verify
    </ButtonStyled>
  );
};

const ConfirmationOverlay: FC<TProps> = ({
  onClose,
  scope,
  pointsRequired, // points required
  points, // all points available
  onAccept
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const isEnoughPoints = points >= pointsRequired;
  const user = useUser()
  const availableTasks = tasks(true); // devmode
  const verificationsState = useVerifications();
  const [selected, setSelected] = useState<string[]>([]);

  const pointsSelected = useMemo(() => {
    let result = 0;

    verificationsState.verifications.forEach((verification) => {
      const relatedTask = defineTaskByCredentialGroupId(
        verification.credentialGroupId,
        true // devmode
      );

      if (!relatedTask) {
        return;
      }
      if (verification.status !== 'completed') {
        return;
      }

      if (!selected.includes(relatedTask.group.credentialGroupId)) {
        return;
      }

      if (relatedTask) {
        result = result + relatedTask.group.points;
      }
    });

    return result;
  }, [selected]);

  useEffect(() => {
    if (!verificationsState.verifications) {
      return;
    }

    setSelected(defineInitialSelectedVerifications(verificationsState.verifications));
  }, [verificationsState.verifications]);

  return (
    <Container>
      <Content>
        <LogoWrapperStyled icon={<Image src={BringGif} />} />
        <TitleStyled>Prove your trust level</TitleStyled>

        <TextStyled>
          A website is requesting verification of your trust score. This process
          is completely private and no personal information will be shared.
        </TextStyled>
        {showInsufficientPointsNote(
          isEnoughPoints,
          pointsRequired,
          points,
          onClose,
        )}
        {showInsufficientPointsMessage(isEnoughPoints, pointsRequired)}
        <MessageStyled>
          <span>Current:</span>
          <Tag status="info">{points} pts</Tag>
        </MessageStyled>
        {isEnoughPoints && (
          <VerificationsSelectListStyled
            tasks={availableTasks}
            devMode={true}
            // devmode
            verifications={verificationsState.verifications}
            selected={selected}
            onSelect={(id, isSelected) => {
              if (!isSelected) {
                setSelected(
                  selected.filter((verification) => verification !== id),
                );
                return;
              }
              setSelected([...selected, id]);
            }}
          />
        )}
        <ButtonsContainer>
          {defineButton(
            user.key,
            verificationsState.verifications,
            isEnoughPoints,
            pointsRequired,
            pointsSelected,
            scope,
            loading,
            setLoading,
            selected,
            onClose,
            onAccept
          )}

          <ButtonStyled
            size="default"
            onClick={async () => {
              onClose();
            }}
          >
            Cancel
          </ButtonStyled>
        </ButtonsContainer>
      </Content>
    </Container>
  );
};

export default ConfirmationOverlay;
