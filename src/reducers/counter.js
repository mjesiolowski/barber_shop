import { createReducer } from '@reduxjs/toolkit';
import { INCREMENT, DECREMENT } from '../actions';

export const counterReducer = createReducer(0, {
  [INCREMENT]: (state, action) => state + action.payload,
  [DECREMENT]: (state, action) => state - action.payload,
});
