import { createStore, combineReducers } from 'redux';
import { testReducer, counterReducer } from '../reducers';

export default () => {
  const store = createStore(
    combineReducers({
      test: testReducer,
      counter: counterReducer,
    }),
    /*eslint-disable */
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    /* eslint-enable */
  );

  return store;
};
