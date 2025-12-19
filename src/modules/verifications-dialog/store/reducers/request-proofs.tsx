import { TVerification } from '@/types';
import { AppRootState } from './index';
import { useSelector } from 'react-redux';

enum ActionType {
  '/requestProofs/registerRequest' = '/requestProofs/registerRequest',
  '/requestProofs/showRequest' = '/requestProofs/showRequest',
  '/requestProofs/resetRequest' = '/requestProofs/resetRequest'
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  error?: boolean;
};

type State = {
  pointsRequired: number | null
  dropAddress: string | null
  isOpen: boolean
};

const initState: State = {
  pointsRequired: null,
  dropAddress: null,
  isOpen: false
};

export const registerRequest = (
  pointsRequired: number,
  dropAddress: string,
): Action<{
  pointsRequired: number,
  dropAddress: string,
}> => ({
  type: ActionType['/requestProofs/registerRequest'],
  payload: {
    pointsRequired,
    dropAddress,
  }
});

export const openRequest = (isOpen: boolean): Action<boolean> => ({
  type: ActionType['/requestProofs/showRequest'],
  payload: isOpen,
});

export const resetRequest = () => ({
  type: ActionType['/requestProofs/resetRequest']
});

export default function requestProofs(
  state = initState,
  action: Action<any>,
): State {
  switch (action.type) {
    case ActionType['/requestProofs/registerRequest']: {
      return {
        ...state,
        pointsRequired: action.payload.pointsRequired,
        dropAddress: action.payload.dropAddress,
      };
    }


    case ActionType['/requestProofs/showRequest']: {
      return {
        ...state,
        isOpen: action.payload
      };
    }


    case ActionType['/requestProofs/resetRequest']: {
      return {
        ...state,
      };
    }
    

    default:
      return state;
  }
}

export const useRequestProofs: () => State = () => {
  return useSelector((state: AppRootState) => {
    return state.requestProofs;
  });
};
