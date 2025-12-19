import { combineReducers } from 'redux';
import user from './user';
import verifications from './verifications';
import modal from './modal';
import requestProofs from './request-proofs';

const rootReducer = combineReducers({
  user,
  verifications,
  modal,
  requestProofs
});

export type AppRootState = ReturnType<typeof rootReducer>;
export default rootReducer;
