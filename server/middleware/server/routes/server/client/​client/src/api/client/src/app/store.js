import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import sessionsReducer from '../features/sessions/sessionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sessions: sessionsReducer,
  },
});
