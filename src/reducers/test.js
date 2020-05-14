import { createReducer } from '@reduxjs/toolkit';
import { SWITCH_BOOLEAN } from '../actions';

export const testReducer = createReducer(true, {
  [SWITCH_BOOLEAN]: (state) => !state,
});
