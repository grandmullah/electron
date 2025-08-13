import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
      id: string;
      name: string;
      phoneNumber: string;
      isLoggedIn: boolean;
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

// Load user from localStorage on app start
const savedUser = localStorage.getItem('betzone_user');
if (savedUser) {
      try {
            initialState.user = JSON.parse(savedUser);
      } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('betzone_user');
      }
}

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
                  localStorage.setItem('betzone_user', JSON.stringify(action.payload));
            },
            loginFailure: (state, action: PayloadAction<string>) => {
                  state.isLoading = false;
                  state.error = action.payload;
            },
            logout: (state) => {
                  state.user = null;
                  state.isLoading = false;
                  state.error = null;
                  localStorage.removeItem('betzone_user');
            },
            clearError: (state) => {
                  state.error = null;
            },
      },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer; 