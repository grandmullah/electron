import axios from 'axios';
import { ManagedUser, AgentBet, CommissionTransaction } from '../store/agentSlice';
import { API_BASE_URL } from './apiConfig';

// Development mode fallback for testing without backend
const isDevelopmentMode = true;
const ENABLE_DEV_FALLBACK = true; // Set to true to enable mock responses

// Types for API requests
interface CreateUserRequest {
      phone_number: string;
      country_code: string;
      password: string;
      commission_rate: number;
}

interface PlaceBetForUserRequest {
      userId: string;
      betType: 'single' | 'multibet';
      stake: number;
      selections: Array<{
            gameId: string;
            homeTeam: string;
            awayTeam: string;
            betType: string;
            selection: string;
            odds: number;
            bookmaker: string;
            gameTime: string;
            sportKey: string;
      }>;
}

interface UpdateUserBalanceRequest {
      amount: number;
      type: 'deposit' | 'withdrawal';
      description: string;
}

class AgentService {
      private static getAuthHeaders(): Record<string, string> {
            const token = localStorage.getItem('authToken');
            return {
                  'Content-Type': 'application/json',
                  ...(token && { 'Authorization': `Bearer ${token}` }),
            };
      }

      // User Management
      static async getManagedUsers(): Promise<ManagedUser[]> {
            try {
                  console.log('Fetching managed users from:', `${API_BASE_URL}/agent/users`);
                  console.log('Auth headers:', this.getAuthHeaders());

                  const response = await axios.get(`${API_BASE_URL}/agent/users`, {
                        headers: this.getAuthHeaders(),
                  });

                  console.log('Managed users response:', response.data);
                  const data = response.data;

                  if (data.success && data.users) {
                        console.log(`Found ${data.count || data.users.length} managed users:`, data.message);
                        return data.users;
                  } else {
                        console.error('Invalid response format:', data);
                        throw new Error('Invalid response format');
                  }
            } catch (error: any) {
                  console.error('Failed to fetch managed users:', error);
                  console.error('Error details:', {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message
                  });

                  // Development fallback for testing without backend
                  if (ENABLE_DEV_FALLBACK && isDevelopmentMode && (error.code === 'ECONNREFUSED' || error.message.includes('Network Error'))) {
                        console.log('Using development fallback data for managed users');
                        return [
                              {
                                    id: '1',
                                    phone_number: '+1234567890',
                                    country_code: 'US',
                                    dial_code: '+1',
                                    role: 'user' as const,
                                    balance: 150.50,
                                    currency: 'USD',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                    lastLoginAt: new Date().toISOString(),
                                    isActive: true,
                                    bettingLimits: {
                                          minStake: 1,
                                          maxStake: 1000,
                                          maxDailyLoss: 500,
                                          maxWeeklyLoss: 2000
                                    },
                                    preferences: {
                                          oddsFormat: 'decimal',
                                          timezone: 'UTC',
                                          notifications: {
                                                betSettled: true,
                                                oddsChanged: false,
                                                newGames: true
                                          }
                                    }
                              },
                              {
                                    id: '2',
                                    phone_number: '+9876543210',
                                    country_code: 'KE',
                                    dial_code: '+254',
                                    role: 'user' as const,
                                    balance: 75.25,
                                    currency: 'USD',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                    lastLoginAt: null,
                                    isActive: true,
                                    bettingLimits: {
                                          minStake: 1,
                                          maxStake: 500,
                                          maxDailyLoss: 200,
                                          maxWeeklyLoss: 1000
                                    },
                                    preferences: {
                                          oddsFormat: 'decimal',
                                          timezone: 'Africa/Nairobi',
                                          notifications: {
                                                betSettled: true,
                                                oddsChanged: true,
                                                newGames: false
                                          }
                                    }
                              }
                        ];
                  }

                  if (error.response?.status === 401) {
                        throw new Error('Authentication failed. Please log in as an agent.');
                  } else if (error.response?.status === 403) {
                        throw new Error('Access denied. Agent privileges required.');
                  } else if (error.response?.status === 404) {
                        throw new Error('Agent endpoint not found. Please check if the backend server is running.');
                  } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                        throw new Error('Unable to connect to server. Please ensure the backend server is running on http://localhost:8000');
                  }

                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch managed users');
            }
      }

      static async createUser(userData: CreateUserRequest): Promise<ManagedUser> {
            try {
                  const response = await axios.post(`${API_BASE_URL}/agent/users`, userData, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  throw new Error(error.response?.data?.message || 'Failed to create user');
            }
      }

      static async updateUserBalance(userId: string, request: UpdateUserBalanceRequest): Promise<ManagedUser> {
            try {
                  console.log(`Updating balance for user ${userId}:`, request);

                  const response = await axios.post(
                        `${API_BASE_URL}/agent/users/${userId}/balance`,
                        request,
                        {
                              headers: this.getAuthHeaders(),
                        }
                  );

                  console.log('Balance update response:', response.data);
                  return response.data;
            } catch (error: any) {
                  if (isDevelopmentMode && ENABLE_DEV_FALLBACK) {
                        console.log('Development mode: returning mock balance update response');
                        return {
                              id: userId,
                              phone_number: '+1234567890',
                              country_code: 'US',
                              dial_code: '+1',
                              role: 'user' as const,
                              balance: 150.00, // Mock updated balance
                              currency: 'USD',
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              lastLoginAt: new Date().toISOString(),
                              isActive: true,
                              bettingLimits: {
                                    minStake: 1,
                                    maxStake: 1000,
                                    maxDailyLoss: 500,
                                    maxWeeklyLoss: 2000,
                              },
                              preferences: {
                                    oddsFormat: 'decimal',
                                    timezone: 'UTC',
                                    notifications: {
                                          betSettled: true,
                                          oddsChanged: false,
                                          newGames: true,
                                    },
                              },
                        };
                  }
                  console.error('Failed to update user balance:', error);
                  throw new Error(error.response?.data?.message || 'Failed to update user balance');
            }
      }

      static async deactivateUser(userId: string): Promise<void> {
            try {
                  await axios.post(`${API_BASE_URL}/agent/users/${userId}/deactivate`, {}, {
                        headers: this.getAuthHeaders(),
                  });
            } catch (error: any) {
                  throw new Error(error.response?.data?.message || 'Failed to deactivate user');
            }
      }

      // Bet Management
      static async placeBetForUser(request: PlaceBetForUserRequest): Promise<AgentBet> {
            try {
                  console.log('Placing bet for user:', request.userId);
                  console.log('Bet request:', request);

                  // Extract userId from request and create the correct payload
                  const { userId, ...betPayload } = request;

                  const response = await axios.post(
                        `${API_BASE_URL}/agent/users/${userId}/bets`,
                        betPayload,
                        {
                              headers: this.getAuthHeaders(),
                        }
                  );

                  console.log('Bet placement response:', response.data);
                  return response.data;
            } catch (error: any) {
                  console.error('Failed to place bet for user:', error);

                  // Development fallback for testing without backend
                  if (ENABLE_DEV_FALLBACK && isDevelopmentMode && (error.code === 'ECONNREFUSED' || error.message.includes('Network Error'))) {
                        console.log('Using development fallback for bet placement');
                        const { userId, ...payload } = request;

                        // Calculate potential winnings based on bet type
                        let potentialWinnings: number;
                        if (payload.betType === 'multibet') {
                              // For multibet, multiply all odds together
                              const combinedOdds = payload.selections.reduce((total, sel) => total * sel.odds, 1);
                              potentialWinnings = payload.stake * combinedOdds;
                        } else {
                              // For single bet, use first selection's odds
                              potentialWinnings = payload.stake * (payload.selections[0]?.odds || 1);
                        }

                        return {
                              id: 'bet_' + Date.now(),
                              userId: request.userId,
                              userPhone: '+1234567890',
                              userCountry: 'US',
                              agentId: 'mock_agent_id',
                              betType: payload.betType,
                              status: 'pending' as const,
                              totalStake: payload.stake,
                              potentialWinnings: potentialWinnings,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              settledAt: null,
                              cancelledAt: null,
                              selections: payload.selections.map(selection => ({
                                    ...selection,
                                    stake: payload.betType === 'multibet' ? payload.stake / payload.selections.length : payload.stake,
                                    potentialWinnings: payload.betType === 'multibet' ?
                                          (payload.stake * selection.odds) / payload.selections.length :
                                          payload.stake * selection.odds
                              }))
                        };
                  }
                  console.error('Error details:', {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message
                  });

                  if (error.response?.status === 400) {
                        throw new Error(error.response?.data?.message || 'Invalid bet data provided');
                  } else if (error.response?.status === 401) {
                        throw new Error('Authentication failed. Please log in as an agent.');
                  } else if (error.response?.status === 403) {
                        throw new Error('Access denied. Agent privileges required.');
                  } else if (error.response?.status === 404) {
                        throw new Error('User not found or endpoint not available.');
                  } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                        throw new Error('Unable to connect to server. Please ensure the backend server is running on http://localhost:8000');
                  }

                  throw new Error(error.response?.data?.message || error.message || 'Failed to place bet for user');
            }
      }

      static async getAgentBets(status?: 'pending' | 'accepted' | 'rejected' | 'settled'): Promise<AgentBet[]> {
            try {
                  console.log('Fetching agent bets from:', `${API_BASE_URL}/agent/bets`);
                  console.log('Auth headers:', this.getAuthHeaders());

                  const url = status
                        ? `${API_BASE_URL}/agent/bets?status=${status}`
                        : `${API_BASE_URL}/agent/bets`;

                  console.log('Fetching from URL:', url);

                  const response = await axios.get(url, {
                        headers: this.getAuthHeaders(),
                  });

                  console.log('Agent bets response:', response.data);
                  const data = response.data;

                  if (Array.isArray(data)) {
                        console.log(`Found ${data.length} agent bets`);
                        return data;
                  } else if (data.success && Array.isArray(data.bets)) {
                        console.log(`Found ${data.bets.length} agent bets:`, data.message);
                        return data.bets;
                  } else if (data.success && Array.isArray(data.data)) {
                        console.log(`Found ${data.data.length} agent bets`);
                        return data.data;
                  } else {
                        console.error('Invalid response format:', data);
                        return []; // Return empty array if no bets found
                  }
            } catch (error: any) {
                  console.error('Failed to fetch agent bets:', error);
                  console.error('Error details:', {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message
                  });

                  // Development fallback for testing without backend
                  if (ENABLE_DEV_FALLBACK && isDevelopmentMode && (error.code === 'ECONNREFUSED' || error.message.includes('Network Error'))) {
                        console.log('Using development fallback data for agent bets');
                        return [
                              {
                                    id: 'e6605640-aa14-4974-b153-061a4e0de478',
                                    userId: '64b2299e-df7f-422a-a31b-18d7533450b7',
                                    userPhone: '+447234567890',
                                    userCountry: 'GB',
                                    agentId: 'ddfa1d68-24db-4916-82b5-edd4fa6766e6',
                                    betType: 'single' as const,
                                    status: 'pending' as const,
                                    totalStake: 15,
                                    potentialWinnings: 27.75,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                    settledAt: null,
                                    cancelledAt: null,
                                    selections: [{
                                          gameId: 'TEST_LIST_001',
                                          homeTeam: 'List Test FC',
                                          awayTeam: 'API Test United',
                                          betType: 'match_winner',
                                          selection: 'List Test FC',
                                          odds: 1.85,
                                          stake: 15,
                                          potentialWinnings: 27.75
                                    }]
                              },
                              {
                                    id: 'f7705641-bb15-4975-c154-062b4f0ef479',
                                    userId: '75c3399f-eg8g-533b-b42c-19e8644551c8',
                                    userPhone: '+1555123456',
                                    userCountry: 'US',
                                    agentId: 'ddfa1d68-24db-4916-82b5-edd4fa6766e6',
                                    betType: 'single' as const,
                                    status: 'accepted' as const,
                                    totalStake: 50,
                                    potentialWinnings: 125,
                                    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                                    updatedAt: new Date(Date.now() - 86400000).toISOString(),
                                    settledAt: null,
                                    cancelledAt: null,
                                    selections: [{
                                          gameId: 'MATCH_002',
                                          homeTeam: 'Arsenal',
                                          awayTeam: 'Chelsea',
                                          betType: 'match_winner',
                                          selection: 'Arsenal',
                                          odds: 2.50,
                                          stake: 50,
                                          potentialWinnings: 125
                                    }]
                              }
                        ];
                  }

                  if (error.response?.status === 401) {
                        throw new Error('Authentication failed. Please log in as an agent.');
                  } else if (error.response?.status === 403) {
                        throw new Error('Access denied. Agent privileges required.');
                  } else if (error.response?.status === 404) {
                        throw new Error('Agent bets endpoint not found. Please check if the backend server is running.');
                  } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                        throw new Error('Unable to connect to server. Please ensure the backend server is running on http://localhost:8000');
                  }

                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch agent bets');
            }
      }

      static async updateBetStatus(betId: string, status: 'accepted' | 'rejected'): Promise<AgentBet> {
            try {
                  console.log(`Updating bet ${betId} status to:`, status);

                  const response = await axios.patch(
                        `${API_BASE_URL}/agent/bets/${betId}/status`,
                        { status },
                        {
                              headers: this.getAuthHeaders(),
                        }
                  );

                  console.log('Bet status update response:', response.data);
                  return response.data;
            } catch (error: any) {
                  console.error('Failed to update bet status:', error);
                  console.error('Error details:', {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message
                  });

                  if (error.response?.status === 400) {
                        throw new Error('Invalid bet status or bet ID provided');
                  } else if (error.response?.status === 401) {
                        throw new Error('Authentication failed. Please log in as an agent.');
                  } else if (error.response?.status === 403) {
                        throw new Error('Access denied. Agent privileges required.');
                  } else if (error.response?.status === 404) {
                        throw new Error('Bet not found or endpoint not available.');
                  } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                        throw new Error('Unable to connect to server. Please ensure the backend server is running on http://localhost:8000');
                  }

                  throw new Error(error.response?.data?.message || error.message || 'Failed to update bet status');
            }
      }

      // Commission Management
      static async getCommissionTransactions(): Promise<CommissionTransaction[]> {
            try {
                  const response = await axios.get(`${API_BASE_URL}/agent/commissions`, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  throw new Error(error.response?.data?.message || 'Failed to fetch commission transactions');
            }
      }

      static async getAgentStats(): Promise<{
            managedUsers: number;
            totalUsers: number;
            activeUsers: number;
            totalBalance: number;
      }> {
            try {
                  const response = await axios.get(`${API_BASE_URL}/agent/stats`, {
                        headers: this.getAuthHeaders(),
                  });

                  const data = response.data;
                  if (data.success && data.stats) {
                        console.log('Agent stats loaded:', data.stats);
                        return data.stats;
                  } else {
                        throw new Error('Invalid stats response format');
                  }
            } catch (error: any) {
                  console.error('Failed to fetch agent stats:', error);
                  throw new Error(error.response?.data?.message || 'Failed to fetch agent stats');
            }
      }

      // User Activity
      static async getUserActivity(userId: string): Promise<{
            bets: AgentBet[];
            balanceHistory: Array<{
                  amount: number;
                  type: 'deposit' | 'withdrawal';
                  date: string;
            }>;
      }> {
            try {
                  const response = await axios.get(`${API_BASE_URL}/agent/users/${userId}/activity`, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  throw new Error(error.response?.data?.message || 'Failed to fetch user activity');
            }
      }
}

export default AgentService; 