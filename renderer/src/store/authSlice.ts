import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '../services/authService';

export interface User {
      id: string;
      name: string;
      phoneNumber: string;
      isLoggedIn: boolean;
      role: 'user' | 'agent' | 'admin';
      agentId?: string; // If user is managed by an agent
      managedUsers?: string[]; // If user is an agent, list of managed user IDs
      balance: number;
      commission?: number; // Agent commission percentage
      currency: string;
      isActive: boolean;
      bettingLimits: {
            minStake: number;
            maxStake: number;
            maxDailyLoss: number;
            maxWeeklyLoss: number;
      };
      preferences: {
            oddsFormat: 'decimal' | 'fractional' | 'american';
            timezone: string;
            notifications: {
                  betSettled: boolean;
                  oddsChanged: boolean;
                  newGames: boolean;
            };
      };
}

export interface AuthState {
      user: User | null;
      isLoading: boolean;
      error: string | null;
}

const initialState: AuthState = {
      user: null,
      isLoading: false,
      error: null,
};

export const authSlice = createSlice({
      name: 'auth',
      initialState,
      reducers: {
            loginStart: (state) => {
                  state.isLoading = true;
                  state.error = null;
            },
            loginSuccess: (state, action: PayloadAction<User>) => {
                  state.user = action.payload;
                  state.isLoading = false;
                  state.error = null;
            },
            loginFailure: (state, action: PayloadAction<string>) => {
                  state.isLoading = false;
                  state.error = action.payload;
            },
            logout: (state) => {
                  state.user = null;
                  state.isLoading = false;
                  state.error = null;
            },
            clearError: (state) => {
                  state.error = null;
            },
      },
});

// Helper function to convert AuthUser to User
export const convertAuthUserToUser = (authUser: AuthUser): User => {
      return {
            id: authUser.id,
            name: `User ${authUser.phone_number.slice(-4)}`, // Generate name from phone
            phoneNumber: authUser.phone_number,
            isLoggedIn: true,
            role: authUser.role,
            balance: authUser.balance,
            currency: authUser.currency,
            isActive: authUser.isActive,
            bettingLimits: authUser.bettingLimits,
            preferences: authUser.preferences,
            // Add agent-specific fields if needed
            ...(authUser.role === 'agent' && { commission: 5 }), // Default commission for agents
      };
};

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer; 