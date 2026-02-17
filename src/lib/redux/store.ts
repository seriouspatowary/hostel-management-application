import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import ticketReducer from './slices/ticketSlice'
import authReducer from './slices/authSlice';
import issuesReducer from './slices/issueSlice';
import messageReducer from './slices/messageSlice';



export const store = configureStore({
  reducer: {
    counter: counterReducer,
    ticket: ticketReducer,
    auth: authReducer,
    issues: issuesReducer,
    message: messageReducer

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
