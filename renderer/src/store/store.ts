import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import betslipReducer from './betslipSlice';
import agentReducer from './agentSlice';

export const store = configureStore({
      reducer: {
            auth: authReducer,
            betslip: betslipReducer,
            agent: agentReducer,
      },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 