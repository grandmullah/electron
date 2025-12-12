import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '../services/authService';

export interface User {
      id: string;
      name: string;
      phoneNumber: string;
      isLoggedIn: boolean;
      role: 'user' | 'agent' | 'super_agent' | 'admin';
      agentId?: string; // If user is managed by an agent
      managedUsers?: string[]; // If user is an agent, list of managed user IDs
      balance: number;
      commission?: number; // Agent commission percentage
      currency: string;
      shop_id?: string;
      shop?: {
            id: string;
            shop_name: string;
            shop_code: string;
            shop_address?: string;
            default_currency: string;
            commission_rate: number;
      };
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
      // Add null checks and default values
      if (!authUser) {
            throw new Error('AuthUser is undefined or null');
      }

      // Generate name from phone number with fallback
      let userName = 'User';
      if (authUser.phone_number) {
            try {
                  userName = `User ${authUser.phone_number.slice(-4)}`;
            } catch (error) {
                  console.warn('Failed to generate name from phone number:', error);
                  userName = `User ${authUser.phone_number || 'Unknown'}`;
            }
      }

      return {
            id: authUser.id || 'unknown',
            name: userName,
            phoneNumber: authUser.phone_number || '',
            isLoggedIn: true,
            role: authUser.role || 'user',
            balance: authUser.balance || 0,
            currency: authUser.currency || 'USD',
            ...(authUser.shop_id && { shop_id: authUser.shop_id }),
            ...(authUser.shop && { shop: authUser.shop }),
            // Handle isActive field
            isActive: authUser.isActive ?? true,
            bettingLimits: (() => {
                  // Check for both camelCase and snake_case betting limits
                  const backendLimits = authUser.bettingLimits || authUser.betting_limits;

                  if (backendLimits) {
                        console.log('Using backend betting limits:', backendLimits);

                        // Map snake_case fields to camelCase
                        const mappedLimits = {
                              minStake: 'minStake' in backendLimits ? backendLimits.minStake : ('min_stake' in backendLimits ? backendLimits.min_stake : 10),
                              maxStake: 'maxStake' in backendLimits ? backendLimits.maxStake : ('max_stake' in backendLimits ? backendLimits.max_stake : 100000),
                              maxDailyLoss: 'maxDailyLoss' in backendLimits ? backendLimits.maxDailyLoss : ('max_daily_loss' in backendLimits ? backendLimits.max_daily_loss : 10000),
                              maxWeeklyLoss: 'maxWeeklyLoss' in backendLimits ? backendLimits.maxWeeklyLoss : ('max_weekly_loss' in backendLimits ? backendLimits.max_weekly_loss : 50000),
                        };

                        console.log('Mapped betting limits:', mappedLimits);
                        return mappedLimits;
                  } else {
                        console.log('No backend betting limits, using defaults');
                        return {
                              minStake: 10,
                              maxStake: 100000,
                              maxDailyLoss: 10000,
                              maxWeeklyLoss: 50000,
                        };
                  }
            })(),
            preferences: (() => {
                  const backendPrefs = authUser.preferences;

                  if (backendPrefs) {
                        console.log('Using backend preferences:', backendPrefs);

                        // Map snake_case fields to camelCase
                        return {
                              oddsFormat: 'oddsFormat' in backendPrefs ? backendPrefs.oddsFormat : ('odds_format' in backendPrefs ? backendPrefs.odds_format : 'decimal'),
                              timezone: backendPrefs.timezone || 'UTC',
                              notifications: {
                                    betSettled: (() => {
                                          if (backendPrefs.notifications && 'betSettled' in backendPrefs.notifications) {
                                                return backendPrefs.notifications.betSettled;
                                          }
                                          if (backendPrefs.notifications && 'bet_settled' in backendPrefs.notifications) {
                                                return (backendPrefs.notifications as any).bet_settled;
                                          }
                                          return true;
                                    })(),
                                    oddsChanged: (() => {
                                          if (backendPrefs.notifications && 'oddsChanged' in backendPrefs.notifications) {
                                                return backendPrefs.notifications.oddsChanged;
                                          }
                                          if (backendPrefs.notifications && 'odds_changed' in backendPrefs.notifications) {
                                                return (backendPrefs.notifications as any).odds_changed;
                                          }
                                          return true;
                                    })(),
                                    newGames: (() => {
                                          if (backendPrefs.notifications && 'newGames' in backendPrefs.notifications) {
                                                return backendPrefs.notifications.newGames;
                                          }
                                          if (backendPrefs.notifications && 'new_games' in backendPrefs.notifications) {
                                                return (backendPrefs.notifications as any).new_games;
                                          }
                                          return true;
                                    })(),
                              },
                        };
                  } else {
                        console.log('No backend preferences, using defaults');
                        return {
                              oddsFormat: 'decimal',
                              timezone: 'UTC',
                              notifications: {
                                    betSettled: true,
                                    oddsChanged: true,
                                    newGames: true,
                              },
                        };
                  }
            })(),
            // Add agent-specific fields if needed
            ...(authUser.role === 'agent' && { commission: 5 }), // Default commission for agents
      };
};

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer; 