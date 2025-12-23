import { TVerification } from '@/types';
import { AppRootState } from './index';
import { useSelector } from 'react-redux';

enum ActionType {
  '/requestProofs/registerRequest' = '/requestProofs/registerRequest',
  '/requestProofs/showRequest' = '/requestProofs/showRequest',
  '/requestProofs/resetRequest' = '/requestProofs/resetRequest',
  '/requestProofs/setScope' = '/requestProofs/setScope'
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  error?: boolean;
};

type State = {
  pointsRequired: number | null
  isOpen: boolean
  scope: string | null
};

const initState: State = {
  pointsRequired: null,
  isOpen: false,
  scope: null
};

export const registerRequest = (
  pointsRequired: number
): Action<number> => ({
  type: ActionType['/requestProofs/registerRequest'],
  payload: pointsRequired
});

export const openRequest = (isOpen: boolean): Action<boolean> => ({
  type: ActionType['/requestProofs/showRequest'],
  payload: isOpen,
});


export const setScope = (scope: string | null): Action<string | null> => ({
  type: ActionType['/requestProofs/setScope'],
  payload: scope,
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
        pointsRequired: action.payload
      };
    }


    case ActionType['/requestProofs/showRequest']: {
      return {
        ...state,
        isOpen: action.payload
      };
    }

    case ActionType['/requestProofs/setScope']: {
      return {
        ...state,
        scope: action.payload
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
