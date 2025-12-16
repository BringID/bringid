import type {} from 'redux-thunk/extend-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers';

const middlewares = [thunk];

if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger({ collapsed: true }));
}

const store = createStore(rootReducer, applyMiddleware(...middlewares));

export default store;
