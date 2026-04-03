import axios from 'axios';
import { ManagedUser, AgentBet, CommissionTransaction, ManagedAgent } from '../store/agentSlice';
import { API_BASE_URL, API_KEY } from './apiConfig';

// Development mode fallback for testing without backend
const isDevelopmentMode = true;
const ENABLE_DEV_FALLBACK = true; // Set to true to enable mock responses

import { BetSlipService } from './betslipService';

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

interface MintBalanceRequest {
      amount: number;
      notes?: string;
}

interface CreateAgentRequest {
      phone_number: string;
      password: string;
      country_code: string;
}

interface ShopAnalytics {
      shop_id: string;
      totalUsers: number;
      totalAgents: number;
      activeUsers: number;
      totalBalance: number;
      totalBets: number;
      totalStake: number;
}

// Removed ShopAgentSummary - using ManagedAgent from agentSlice instead

interface PlaceShopBetRequest {
      selections: Array<{
            gameId: string;
            homeTeam?: string;
            awayTeam?: string;
            marketType: string;
            outcome: string;
            odds: number | { decimal: number; american?: number; multiplier?: number };
            bookmaker?: string;
            gameTime?: string;
            sportKey?: string;
      }>;
      stake: number;
}

interface SavedShopSelection {
      gameId: string;
      homeTeam?: string;
      awayTeam?: string;
      marketType: string;
      outcome: string;
      odds?: { decimal?: number; american?: number; multiplier?: number } | number;
      bookmaker?: string;
      gameTime?: string;
      sportKey?: string;
}

interface SavedShopBetSlip {
      id?: string;
      userId?: string;
      stake: number;
      selections: SavedShopSelection[];
}

export interface StalePendingSelectionActionable {
      canUpdateScores: boolean;
      canUpdateHalftime: boolean;
      canFetchFromApiFootball: boolean;
      missingEvents: boolean;
      missingStats: boolean;
}

export interface StalePendingSelectionRow {
      selectionId: string;
      betId: string;
      selectionGameId: string;
      marketType: string;
      selection: string;
      selectionCreatedAt: string;
      betStatus: string;
      gameId: string;
      externalId: string | null;
      commenceTime: string | null;
      gameStatus: string | null;
      gameSettlementStatus: string | null;
      homeScore: number | null;
      awayScore: number | null;
      homeHalftimeScore: number | null;
      awayHalftimeScore: number | null;
      halftimeSettlementStatus: string | null;
      leagueKey: string | null;
      hasStatistics: boolean;
      hasEvents: boolean;
      blockers: string[];
      actionable: StalePendingSelectionActionable;
}

export interface StalePendingSelectionsPagination {
      total: number;
      limit: number;
      offset: number;
}

export interface ListStalePendingSelectionsParams {
      minAgeHours?: number;
      limit?: number;
      offset?: number;
      leagueKey?: string;
      marketType?: string;
}

export interface ListStalePendingSelectionsResponse {
      success: boolean;
      data: StalePendingSelectionRow[];
      pagination: StalePendingSelectionsPagination;
}

export interface RemediatePendingSelectionPayload {
      fetchFromApiFootball?: boolean;
      manual?: {
            scores?: {
                  home: number;
                  away: number;
                  status?: string;
                  settlementStatus?: string;
            };
            halftimeScores?: {
                  home: number;
                  away: number;
                  settled?: boolean;
            };
      };
}

export interface RemediatePendingSelectionResponse {
      success: boolean;
      message: string;
      data: {
            selectionId: string;
            before?: {
                  blockers?: string[];
                  actionable?: Partial<StalePendingSelectionActionable>;
            };
            after?: {
                  blockers?: string[];
                  actionable?: Partial<StalePendingSelectionActionable>;
            };
            impactedSelectionIds?: string[];
            impactedBetIds?: string[];
            settlementResult?: {
                  message?: string;
                  selectionsProcessed?: number;
                  selectionsWon?: number;
                  selectionsLost?: number;
                  selectionsVoided?: number;
                  errors?: number;
            };
            betSettlementResult?: {
                  message?: string;
                  betsProcessed?: number;
                  betsWon?: number;
                  betsLost?: number;
                  betsVoided?: number;
                  totalWinnings?: number;
                  errors?: number;
            };
      };
}

class AgentService {
      private static getAuthHeaders(): Record<string, string> {
            const token = localStorage.getItem('authToken');
            return {
                  'Content-Type': 'application/json',
                  'X-API-Key': API_KEY,
                  ...(token && { 'Authorization': `Bearer ${token}` }),
            };
      }

      // User Management
      static async getManagedUsers(): Promise<ManagedUser[]> {
            try {
                  const response = await axios.get(`${API_BASE_URL}/agent/users`, {
                        headers: this.getAuthHeaders(),
                  });
                  const data = response.data;

                  if (data.success && data.users) {
                        return data.users;
                  }
                  throw new Error('Invalid response format');
            } catch (error: any) {
                  if (ENABLE_DEV_FALLBACK && isDevelopmentMode && (error.code === 'ECONNREFUSED' || error.message.includes('Network Error'))) {
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
                        throw new Error(`Unable to connect to server. Please check your internet connection and API settings (API_BASE_URL=${API_BASE_URL}).`);
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

      // Send money to a user (by phone number)
      static async sendMoneyToUser(phoneNumber: string, amount: number, description?: string): Promise<{
            success: boolean;
            message: string;
            transaction: {
                  id: string;
                  amount: number;
                  recipientPhone: string;
                  agentBalance: number;
            };
      }> {
            try {
                  console.log(`Sending ${amount} to ${phoneNumber}`);

                  const response = await axios.post(
                        `${API_BASE_URL}/agent/send-money`,
                        {
                              phone_number: phoneNumber,
                              amount,
                              description: description || 'Money transfer from agent'
                        },
                        {
                              headers: this.getAuthHeaders(),
                        }
                  );

                  console.log('Money transfer response:', response.data);
                  return response.data;
            } catch (error: any) {
                  console.error('Failed to send money:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to send money');
            }
      }

      // Get agents within the same shop (for super agents)
      static async getShopAgents(): Promise<ManagedAgent[]> {
            try {
                  const response = await axios.get(`${API_BASE_URL}/shop/users`, {
                        headers: this.getAuthHeaders(),
                  });

                  const data = response.data;
                  if (data.success && Array.isArray(data.data)) {
                        // NOTE: This endpoint returns ALL shop-associated users (agents, users, super_agents).
                        // The UI decides what actions to show per-role.
                        return data.data.map((u: any) => ({
                              id: u.id,
                              phone_number: u.phone_number,
                              role: u.role,
                              balance: Number(u.balance ?? 0),
                              isActive: Boolean(u.is_active ?? u.isActive),
                              createdAt: u.created_at || u.createdAt || new Date().toISOString(),
                        }));
                  }

                  throw new Error(data.message || data.error || 'Failed to fetch shop agents');
            } catch (error: any) {
                  console.error('Failed to fetch shop agents:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch shop agents');
            }
      }

      /**
       * Create a new agent for the shop (Super Agent only)
       * @param request - Agent creation request with phone_number, password, and country_code
       * @returns Created agent user object
       */
      static async createAgent(request: CreateAgentRequest): Promise<ManagedAgent> {
            try {
                  console.log('Creating agent:', request);

                  const response = await axios.post(
                        `${API_BASE_URL}/shop/agents`,
                        request,
                        {
                              headers: this.getAuthHeaders(),
                        }
                  );

                  console.log('Create agent response:', response.data);

                  if (response.data.success && response.data.user) {
                        const user = response.data.user;
                        return {
                              id: user.id,
                              phone_number: user.phone_number,
                              role: user.role === 'super_agent' ? 'super_agent' : 'agent',
                              balance: Number(user.balance ?? 0),
                              isActive: Boolean(user.is_active ?? user.isActive ?? true),
                              createdAt: user.created_at || user.createdAt || new Date().toISOString(),
                        };
                  }

                  throw new Error(response.data.message || 'Failed to create agent');
            } catch (error: any) {
                  console.error('Failed to create agent:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to create agent');
            }
      }

      /**
       * Mint balance to an agent (Super Agent only)
       * This creates new balance for the agent without deducting from the super agent
       * @param agentId - The ID of the agent to mint balance to
       * @param request - Mint request with amount and optional notes
       * @returns Response with agentId, amount, and newBalance
       */
      static async mintBalanceToAgent(agentId: string, request: MintBalanceRequest): Promise<{
            success: boolean;
            message: string;
            data: {
                  agentId: string;
                  amount: number;
                  newBalance: number;
            };
      }> {
            try {
                  console.log(`Minting balance to agent ${agentId}:`, request);

                  const response = await axios.post(
                        `${API_BASE_URL}/shop/agents/${agentId}/mint`,
                        request,
                        {
                              headers: this.getAuthHeaders(),
                        }
                  );

                  console.log('Mint balance response:', response.data);
                  return response.data;
            } catch (error: any) {
                  console.error('Failed to mint balance to agent:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to mint balance to agent');
            }
      }

      /**
       * Get shop analytics (Super Agent only)
       * @returns Shop analytics including users, agents, balance, and betting stats
       */
      static async getShopAnalytics(): Promise<ShopAnalytics> {
            try {
                  console.log('Fetching shop analytics...');

                  const response = await axios.get(`${API_BASE_URL}/shop/analytics`, {
                        headers: this.getAuthHeaders(),
                  });

                  console.log('Shop analytics response:', response.data);
                  console.log('Shop analytics response.data:', response.data?.data);

                  // Handle different response structures
                  let analyticsData: any = null;

                  if (response.data.success && response.data.data) {
                        analyticsData = response.data.data;
                  } else if (response.data && !response.data.success) {
                        // Response might have data directly
                        analyticsData = response.data;
                  } else if (response.data) {
                        // Try to use response.data directly
                        analyticsData = response.data;
                  }

                  if (analyticsData) {
                        // Normalize field names and ensure numeric values (handle both camelCase and snake_case)
                        const normalized: ShopAnalytics = {
                              shop_id: analyticsData.shop_id || analyticsData.shopId || '',
                              totalUsers: Number(analyticsData.totalUsers || analyticsData.total_users || 0),
                              totalAgents: Number(analyticsData.totalAgents || analyticsData.total_agents || 0),
                              activeUsers: Number(analyticsData.activeUsers || analyticsData.active_users || 0),
                              totalBalance: Number(analyticsData.totalBalance || analyticsData.total_balance || 0),
                              totalBets: Number(analyticsData.totalBets || analyticsData.total_bets || 0),
                              totalStake: Number(analyticsData.totalStake || analyticsData.total_stake || 0),
                        };
                        console.log('Parsed analytics data:', normalized);
                        console.log('Raw analytics data keys:', Object.keys(analyticsData));
                        return normalized;
                  }

                  throw new Error(response.data?.message || 'Failed to fetch shop analytics');
            } catch (error: any) {
                  console.error('Failed to fetch shop analytics:', error);
                  console.error('Error response:', error.response?.data);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch shop analytics');
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
                        throw new Error(`Unable to connect to server. Please check your internet connection and API settings (API_BASE_URL=${API_BASE_URL}).`);
                  }

                  throw new Error(error.response?.data?.message || error.message || 'Failed to place bet for user');
            }
      }

      static async placeShopBet(request: PlaceShopBetRequest): Promise<AgentBet> {
            try {
                  console.log('Placing shop bet:', request);

                  const response = await axios.post(
                        `${API_BASE_URL}/agent/shop/bets`,
                        request,
                        {
                              headers: this.getAuthHeaders(),
                        }
                  );

                  console.log('Shop bet placement response:', response.data);

                  // Map response to AgentBet format if needed, or return as is
                  // The backend returns: { success: true, bet: { id, ticketNumber, ... }, ticketNumber, message }
                  // We need to return an AgentBet object to be compatible with the store
                  const result = response.data;

                  if (result.success && result.bet) {
                        return {
                              ...result.bet,
                              status: 'accepted', // Shop bets are immediately accepted/printed
                              totalStake: request.stake,
                              // Add other fields if necessary for frontend compatibility
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              selections: request.selections
                        };
                  }

                  throw new Error(result.message || 'Failed to place shop bet');
            } catch (error: any) {
                  console.error('Failed to place shop bet:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to place shop bet');
            }
      }

      static async lookupSavedSelectionsByCode(code: string): Promise<SavedShopBetSlip> {
            try {
                  const response = await axios.post(
                        `${API_BASE_URL}/agent/selections/lookup`,
                        { betCode: code },
                        { headers: this.getAuthHeaders() }
                  );

                  const data = response.data;
                  if (data?.success && data?.data) {
                        return data.data as SavedShopBetSlip;
                  }

                  throw new Error(data?.error || 'Code lookup failed');
            } catch (error: any) {
                  throw new Error(error.response?.data?.error || error.message || 'Failed to lookup saved selections');
            }
      }

      static async placeShopBetFromCode(code: string, overrideStake?: number): Promise<AgentBet> {
            const betSlip = await this.lookupSavedSelectionsByCode(code);
            const stake = Number(overrideStake ?? betSlip?.stake ?? 0);

            if (!Array.isArray(betSlip?.selections) || betSlip.selections.length === 0) {
                  throw new Error('Saved code has no selections');
            }
            if (!stake || stake <= 0) {
                  throw new Error('Saved code has invalid stake');
            }

            return this.placeShopBet({
                  stake,
                  selections: betSlip.selections.map((s) => ({
                        gameId: s.gameId,
                        homeTeam: s.homeTeam || 'TBD',
                        awayTeam: s.awayTeam || 'TBD',
                        marketType: s.marketType,
                        outcome: s.outcome,
                        odds: typeof s.odds === 'number' ? s.odds : Number(s.odds?.decimal || 1),
                        bookmaker: s.bookmaker || 'Betzone',
                        ...(s.gameTime ? { gameTime: s.gameTime } : {}),
                        ...(s.sportKey ? { sportKey: s.sportKey } : { sportKey: 'soccer' })
                  }))
            });
      }

      static async getAgentBets(status?: 'pending' | 'accepted' | 'rejected' | 'settled'): Promise<AgentBet[]> {
            try {
                  const url = status
                        ? `${API_BASE_URL}/agent/bets?status=${status}`
                        : `${API_BASE_URL}/agent/bets`;

                  const response = await axios.get(url, {
                        headers: this.getAuthHeaders(),
                  });
                  const data = response.data;

                  const normalize = (raw: any): AgentBet => {
                        const selectionsRaw: any[] = Array.isArray(raw?.selections) ? raw.selections : [];
                        const selections = selectionsRaw.map((s) => ({
                              gameId: String(s.gameId ?? s.game_id ?? ''),
                              homeTeam: String(s.homeTeam ?? s.home_team ?? ''),
                              awayTeam: String(s.awayTeam ?? s.away_team ?? ''),
                              betType: String(s.betType ?? s.market_type ?? ''),
                              selection: String(s.selection ?? ''),
                              odds: Number(s.odds ?? s.odds_data?.decimal ?? 1),
                              stake: Number(s.stake ?? 0),
                              potentialWinnings: Number(s.potentialWinnings ?? s.potential_winnings ?? 0),
                        }));

                        return {
                              id: String(raw.id),
                              userId: String(raw.userId ?? raw.user_id ?? ''),
                              userPhone: String(raw.userPhone ?? raw.user_phone ?? ''),
                              userCountry: String(raw.userCountry ?? raw.user_country ?? ''),
                              agentId: String(raw.agentId ?? raw.agent_id ?? ''),
                              betType: (raw.betType ?? raw.bet_type ?? (selections.length > 1 ? 'multibet' : 'single')) as any,
                              status: (raw.status ?? 'pending') as any,
                              totalStake: Number(raw.totalStake ?? raw.total_stake ?? 0),
                              potentialWinnings: Number(raw.potentialWinnings ?? raw.potential_winnings ?? 0),
                              createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
                              updatedAt: String(raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
                              settledAt: raw.settledAt ?? raw.settled_at ?? null,
                              cancelledAt: raw.cancelledAt ?? raw.cancelled_at ?? null,
                              selections,
                        };
                  };

                  if (Array.isArray(data)) {
                        return data.map(normalize);
                  }
                  if (data.success && Array.isArray(data.bets)) {
                        return data.bets.map(normalize);
                  }
                  if (data.success && Array.isArray(data.data)) {
                        return data.data.map(normalize);
                  }
                  return [];
            } catch (error: any) {
                  if (ENABLE_DEV_FALLBACK && isDevelopmentMode && (error.code === 'ECONNREFUSED' || error.message.includes('Network Error'))) {
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
                        throw new Error(`Unable to connect to server. Please check your internet connection and API settings (API_BASE_URL=${API_BASE_URL}).`);
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
                        throw new Error(`Unable to connect to server. Please check your internet connection and API settings (API_BASE_URL=${API_BASE_URL}).`);
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

      // Balance History
      static async getBalanceHistory(limit: number = 50): Promise<any[]> {
            try {
                  console.log('Fetching balance history...');
                  const response = await axios.get(`${API_BASE_URL}/agent/balance/history`, {
                        headers: this.getAuthHeaders(),
                        params: { limit },
                  });

                  console.log('Balance history response:', response.data);
                  if (response.data.success && response.data.data) {
                        return response.data.data;
                  }
                  return [];
            } catch (error: any) {
                  console.error('Failed to fetch balance history:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch balance history');
            }
      }

      static async listStalePendingBetSelections(
            params: ListStalePendingSelectionsParams = {}
      ): Promise<ListStalePendingSelectionsResponse> {
            try {
                  const response = await axios.get(`${API_BASE_URL}/admin/bet-selections/pending-stale`, {
                        headers: this.getAuthHeaders(),
                        params,
                  });

                  const rawRows: any[] = Array.isArray(response.data?.data) ? response.data.data : [];
                  const normalizedRows: StalePendingSelectionRow[] = rawRows.map((row) => ({
                        selectionId: String(row.selection_id ?? row.selectionId ?? ""),
                        betId: String(row.bet_id ?? row.betId ?? ""),
                        selectionGameId: String(row.selection_game_id ?? row.selectionGameId ?? ""),
                        marketType: String(row.market_type ?? row.marketType ?? ""),
                        selection: String(row.selection ?? ""),
                        selectionCreatedAt: String(row.selection_created_at ?? row.selectionCreatedAt ?? ""),
                        betStatus: String(row.bet_status ?? row.betStatus ?? ""),
                        gameId: String(row.game_id ?? row.gameId ?? ""),
                        externalId: row.external_id ?? row.externalId ?? null,
                        commenceTime: row.commence_time ?? row.commenceTime ?? null,
                        gameStatus: row.game_status ?? row.gameStatus ?? null,
                        gameSettlementStatus: row.game_settlement_status ?? row.gameSettlementStatus ?? null,
                        homeScore: row.home_score ?? row.homeScore ?? null,
                        awayScore: row.away_score ?? row.awayScore ?? null,
                        homeHalftimeScore: row.home_halftime_score ?? row.homeHalftimeScore ?? null,
                        awayHalftimeScore: row.away_halftime_score ?? row.awayHalftimeScore ?? null,
                        halftimeSettlementStatus: row.halftime_settlement_status ?? row.halftimeSettlementStatus ?? null,
                        leagueKey: row.league_key ?? row.leagueKey ?? null,
                        hasStatistics: Boolean(row.has_statistics ?? row.hasStatistics),
                        hasEvents: Boolean(row.has_events ?? row.hasEvents),
                        blockers: Array.isArray(row.blockers) ? row.blockers.map((b: unknown) => String(b)) : [],
                        actionable: {
                              canUpdateScores: Boolean(row.actionable?.canUpdateScores),
                              canUpdateHalftime: Boolean(row.actionable?.canUpdateHalftime),
                              canFetchFromApiFootball: Boolean(row.actionable?.canFetchFromApiFootball),
                              missingEvents: Boolean(row.actionable?.missingEvents),
                              missingStats: Boolean(row.actionable?.missingStats),
                        },
                  }));

                  const pagination = response.data?.pagination || {};
                  return {
                        success: Boolean(response.data?.success),
                        data: normalizedRows,
                        pagination: {
                              total: Number(pagination.total ?? normalizedRows.length),
                              limit: Number(pagination.limit ?? params.limit ?? 100),
                              offset: Number(pagination.offset ?? params.offset ?? 0),
                        },
                  };
            } catch (error: any) {
                  throw new Error(error.response?.data?.message || error.message || "Failed to fetch stale pending bet selections");
            }
      }

      static async remediatePendingBetSelection(
            selectionId: string,
            payload: RemediatePendingSelectionPayload = { fetchFromApiFootball: true }
      ): Promise<RemediatePendingSelectionResponse> {
            try {
                  const response = await axios.post(
                        `${API_BASE_URL}/admin/bet-selections/pending-stale/${selectionId}/remediate`,
                        payload,
                        { headers: this.getAuthHeaders() }
                  );
                  return response.data as RemediatePendingSelectionResponse;
            } catch (error: any) {
                  throw new Error(error.response?.data?.message || error.message || "Failed to remediate stale pending selection");
            }
      }

      // ==========================================
      // WITHDRAWAL PROCESSING
      // ==========================================

      /**
       * Lookup a withdrawal by code
       * GET /api/agent/withdrawal/lookup?code=ABC12
       */
      static async lookupWithdrawal(code: string): Promise<{
            success: boolean;
            found: boolean;
            data?: {
                  withdrawalId: string;
                  userId: string;
                  amount: number;
                  userPhone: string;
                  userName: string;
                  createdAt: string;
            };
      }> {
            try {
                  const response = await axios.get(
                        `${API_BASE_URL}/agent/withdrawal/lookup?code=${encodeURIComponent(code)}`,
                        { headers: this.getAuthHeaders() }
                  );
                  return response.data;
            } catch (error: any) {
                  throw new Error(
                        error.response?.data?.error ||
                        error.message ||
                        'Failed to lookup withdrawal'
                  );
            }
      }

      /**
       * Complete a withdrawal by code
       * POST /api/agent/withdrawal/complete
       */
      static async completeWithdrawal(withdrawalCode: string): Promise<{
            success: boolean;
            message: string;
            data?: {
                  withdrawalId: string;
                  amount: number;
                  userId: string;
            };
      }> {
            try {
                  const response = await axios.post(
                        `${API_BASE_URL}/agent/withdrawal/complete`,
                        { withdrawalCode },
                        { headers: this.getAuthHeaders() }
                  );
                  return response.data;
            } catch (error: any) {
                  throw new Error(
                        error.response?.data?.error ||
                        error.message ||
                        'Failed to complete withdrawal'
                  );
            }
      }

      // ==========================================
      // DEPOSIT PROCESSING
      // ==========================================

      /**
       * Lookup a deposit by code
       * GET /api/agent/deposit/lookup?code=ABC12
       */
      static async lookupDeposit(code: string): Promise<{
            success: boolean;
            found: boolean;
            data?: {
                  depositId: string;
                  userId: string;
                  amount: number;
                  userPhone: string;
                  userName: string;
                  createdAt: string;
            };
      }> {
            try {
                  const response = await axios.get(
                        `${API_BASE_URL}/agent/deposit/lookup?code=${encodeURIComponent(code)}`,
                        { headers: this.getAuthHeaders() }
                  );
                  return response.data;
            } catch (error: any) {
                  throw new Error(
                        error.response?.data?.error ||
                        error.message ||
                        'Failed to lookup deposit'
                  );
            }
      }

      /**
       * Complete a deposit by code
       * POST /api/agent/deposit/complete
       */
      static async completeDeposit(depositCode: string): Promise<{
            success: boolean;
            message: string;
            data?: {
                  depositId: string;
                  amount: number;
                  userId: string;
                  newBalance: number;
            };
      }> {
            try {
                  const response = await axios.post(
                        `${API_BASE_URL}/agent/deposit/complete`,
                        { depositCode },
                        { headers: this.getAuthHeaders() }
                  );
                  return response.data;
            } catch (error: any) {
                  throw new Error(
                        error.response?.data?.error ||
                        error.message ||
                        'Failed to complete deposit'
                  );
            }
      }
}

export default AgentService; 