import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import boardReducer from './slices/boardSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    board: boardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});