import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import AuthService from './authService';

// Types for bet history API
export interface SingleBet {
      betId: string;
      gameId: string;
      homeTeam: string;
      awayTeam: string;
      betType: string;
      selection: string;
      odds: number;
      stake: number;
      potentialWinnings: number;
      taxPercentage?: number;
      taxAmount?: number;
      netWinnings?: number;
      userId: string;
      timestamp: string;
      status: 'pending' | 'accepted' | 'rejected' | 'settled' | 'cancelled';
      betCategory: 'single';
      settledAt?: string;
      cancelledAt?: string;
      result?: 'won' | 'lost' | 'pending';
      actualWinnings?: number;
}

export interface Multibet {
      betId: string;
      bets: Array<{
            betId: string;
            gameId: string;
            homeTeam: string;
            awayTeam: string;
            betType: string;
            selection: string;
            odds: number;
            stake: number;
            potentialWinnings: number;
      }>;
      totalStake: number;
      combinedOdds: number;
      potentialWinnings: number;
      taxPercentage?: number;
      taxAmount?: number;
      netWinnings?: number;
      userId: string;
      timestamp: string;
      status: 'pending' | 'accepted' | 'rejected' | 'settled' | 'cancelled';
      betType: 'multibet';
      settledAt?: string;
      cancelledAt?: string;
      result?: 'won' | 'lost' | 'pending';
      actualWinnings?: number;
}

export interface UserBetsResponse {
      success: boolean;
      data: {
            singleBets: SingleBet[];
            multibets: Multibet[];
            total: number;
      };
}

export interface BetHistoryFilters {
      status?: 'pending' | 'accepted' | 'rejected' | 'settled' | 'cancelled';
      betType?: 'single' | 'multibet';
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
}

export interface BetActionResponse {
      success: boolean;
      message: string;
      data?: any;
}

export class BetHistoryService {
      private static getAuthToken(): string {
            const token = AuthService.getToken();
            if (!token) {
                  throw new Error('Authentication token not found');
            }
            return token;
      }

      private static getUserId(): string {
            const userId = AuthService.getUserIdFromToken();
            if (!userId) {
                  throw new Error('User ID not found');
            }
            return userId;
      }

      // Fetch user bet history with optional filters
      static async getUserBets(filters?: BetHistoryFilters): Promise<UserBetsResponse> {
            try {
                  const userId = this.getUserId();
                  const token = this.getAuthToken();

                  // Build query parameters
                  const queryParams = new URLSearchParams();
                  if (filters?.status) {
                        queryParams.append('status', filters.status);
                  }
                  if (filters?.betType) {
                        queryParams.append('betType', filters.betType);
                  }
                  if (filters?.dateFrom) {
                        queryParams.append('dateFrom', filters.dateFrom);
                  }
                  if (filters?.dateTo) {
                        queryParams.append('dateTo', filters.dateTo);
                  }
                  if (filters?.limit) {
                        queryParams.append('limit', filters.limit.toString());
                  }
                  if (filters?.offset) {
                        queryParams.append('offset', filters.offset.toString());
                  }

                  const url = `${API_BASE_URL}/bets/history/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                  console.log('Fetching user bets from:', url);

                  const response = await axios.get(url, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000, // 10 second timeout
                  });

                  return response.data;
            } catch (error: any) {
                  console.error('Error fetching user bets:', error);

                  // Return mock data for development
                  if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
                        console.log('Development mode: returning mock bet history');
                        return this.getMockBetHistory(filters);
                  }

                  throw this.handleError(error);
            }
      }

      // Get individual bet details
      static async getBetDetails(betId: string): Promise<SingleBet | Multibet> {
            try {
                  const token = this.getAuthToken();

                  const response = await axios.get(`${API_BASE_URL}/bets/${betId}`, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data.data;
            } catch (error: any) {
                  console.error('Error fetching bet details:', error);
                  throw this.handleError(error);
            }
      }

      // Get active bets for a user
      static async getActiveBets(): Promise<UserBetsResponse> {
            try {
                  const userId = this.getUserId();
                  const token = this.getAuthToken();

                  const url = `${API_BASE_URL}/bets/active/${userId}`;

                  console.log('Fetching active bets from:', url);

                  const response = await axios.get(url, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data;
            } catch (error: any) {
                  console.error('Error fetching active bets:', error);

                  // Return mock data for development
                  if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
                        console.log('Development mode: returning mock active bets');
                        return this.getMockActiveBets();
                  }

                  throw this.handleError(error);
            }
      }

      // Settle a bet
      static async settleBet(betId: string, result: 'won' | 'lost'): Promise<BetActionResponse> {
            try {
                  const token = this.getAuthToken();

                  const response = await axios.put(`${API_BASE_URL}/bets/${betId}/settle`, {
                        result,
                        settledAt: new Date().toISOString()
                  }, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data;
            } catch (error: any) {
                  console.error('Error settling bet:', error);
                  throw this.handleError(error);
            }
      }

      // Cancel a bet
      static async cancelBet(betId: string, reason?: string): Promise<BetActionResponse> {
            try {
                  const token = this.getAuthToken();

                  const response = await axios.put(`${API_BASE_URL}/bets/${betId}/cancel`, {
                        reason: reason || 'User requested cancellation',
                        cancelledAt: new Date().toISOString()
                  }, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data;
            } catch (error: any) {
                  console.error('Error cancelling bet:', error);
                  throw this.handleError(error);
            }
      }

      // Accept a bet (for agents/admins)
      static async acceptBet(betId: string): Promise<BetActionResponse> {
            try {
                  const token = this.getAuthToken();

                  const response = await axios.put(`${API_BASE_URL}/bets/${betId}/accept`, {
                        acceptedAt: new Date().toISOString()
                  }, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data;
            } catch (error: any) {
                  console.error('Error accepting bet:', error);
                  throw this.handleError(error);
            }
      }

      // Reject a bet (for agents/admins)
      static async rejectBet(betId: string, reason: string): Promise<BetActionResponse> {
            try {
                  const token = this.getAuthToken();

                  const response = await axios.put(`${API_BASE_URL}/bets/${betId}/reject`, {
                        reason,
                        rejectedAt: new Date().toISOString()
                  }, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data;
            } catch (error: any) {
                  console.error('Error rejecting bet:', error);
                  throw this.handleError(error);
            }
      }

      // Get bet statistics for user
      static async getBetStatistics(): Promise<{
            totalBets: number;
            totalStake: number;
            totalWinnings: number;
            winRate: number;
            averageOdds: number;
      }> {
            try {
                  const userId = this.getUserId();
                  const token = this.getAuthToken();

                  const response = await axios.get(`${API_BASE_URL}/bets/statistics/${userId}`, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data.data;
            } catch (error: any) {
                  console.error('Error fetching bet statistics:', error);

                  // Return mock statistics for development
                  if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
                        return {
                              totalBets: 25,
                              totalStake: 1250.00,
                              totalWinnings: 875.00,
                              winRate: 0.68,
                              averageOdds: 2.15,
                        };
                  }

                  throw this.handleError(error);
            }
      }

      // Export bet history to CSV
      static async exportBetHistory(filters?: BetHistoryFilters): Promise<Blob> {
            try {
                  const userId = this.getUserId();
                  const token = this.getAuthToken();

                  // Build query parameters
                  const queryParams = new URLSearchParams();
                  if (filters?.status) {
                        queryParams.append('status', filters.status);
                  }
                  if (filters?.betType) {
                        queryParams.append('betType', filters.betType);
                  }
                  if (filters?.dateFrom) {
                        queryParams.append('dateFrom', filters.dateFrom);
                  }
                  if (filters?.dateTo) {
                        queryParams.append('dateTo', filters.dateTo);
                  }

                  const url = `${API_BASE_URL}/bets/history/${userId}/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                  const response = await axios.get(url, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                        },
                        responseType: 'blob',
                        timeout: 30000, // 30 second timeout for export
                  });

                  return response.data;
            } catch (error: any) {
                  console.error('Error exporting bet history:', error);
                  throw this.handleError(error);
            }
      }

      // Mock data for active bets
      private static getMockActiveBets(): UserBetsResponse {
            const mockActiveBets: SingleBet[] = [
                  {
                        betId: 'bet_1705123456789_active1',
                        gameId: 'GAME001',
                        homeTeam: 'Manchester United',
                        awayTeam: 'Liverpool',
                        betType: 'Match Winner',
                        selection: 'Manchester United',
                        odds: 3.0,
                        stake: 25.0,
                        potentialWinnings: 75.0,
                        taxPercentage: 20.0,
                        taxAmount: 15.0,
                        netWinnings: 60.0,
                        userId: 'user123',
                        timestamp: '2024-01-13T20:15:00Z',
                        status: 'pending',
                        betCategory: 'single'
                  },
                  {
                        betId: 'bet_1705123456790_active2',
                        gameId: 'GAME002',
                        homeTeam: 'Arsenal',
                        awayTeam: 'Chelsea',
                        betType: 'Match Winner',
                        selection: 'Arsenal',
                        odds: 2.5,
                        stake: 30.0,
                        potentialWinnings: 75.0,
                        taxPercentage: 20.0,
                        taxAmount: 15.0,
                        netWinnings: 60.0,
                        userId: 'user123',
                        timestamp: '2024-01-13T21:00:00Z',
                        status: 'pending',
                        betCategory: 'single'
                  }
            ];

            return {
                  success: true,
                  data: {
                        singleBets: mockActiveBets,
                        multibets: [],
                        total: mockActiveBets.length
                  }
            };
      }

      // Mock data for development
      private static getMockBetHistory(filters?: BetHistoryFilters): UserBetsResponse {
            const mockSingleBets: SingleBet[] = [
                  {
                        betId: 'bet_1705123456789_abc123',
                        gameId: 'GAME001',
                        homeTeam: 'Manchester United',
                        awayTeam: 'Liverpool',
                        betType: 'Match Winner',
                        selection: 'Manchester United',
                        odds: 3.0,
                        stake: 25.0,
                        potentialWinnings: 75.0,
                        taxPercentage: 20.0,
                        taxAmount: 15.0,
                        netWinnings: 60.0,
                        userId: 'user123',
                        timestamp: '2024-01-13T20:15:00Z',
                        status: 'settled',
                        betCategory: 'single',
                        settledAt: '2024-01-14T22:00:00Z',
                        result: 'won',
                        actualWinnings: 75.0,
                  },
                  {
                        betId: 'bet_1705123456790_def456',
                        gameId: 'GAME002',
                        homeTeam: 'Arsenal',
                        awayTeam: 'Chelsea',
                        betType: 'Match Winner',
                        selection: 'Arsenal',
                        odds: 2.5,
                        stake: 30.0,
                        potentialWinnings: 75.0,
                        taxPercentage: 20.0,
                        taxAmount: 15.0,
                        netWinnings: 60.0,
                        userId: 'user123',
                        timestamp: '2024-01-15T14:20:00Z',
                        status: 'pending',
                        betCategory: 'single',
                        result: 'pending',
                  },
            ];

            const mockMultibets: Multibet[] = [
                  {
                        betId: 'multibet_1705123456791_ghi789',
                        bets: [
                              {
                                    betId: 'bet_1705123456792_jkl012',
                                    gameId: 'GAME003',
                                    homeTeam: 'Barcelona',
                                    awayTeam: 'Real Madrid',
                                    betType: 'Match Winner',
                                    selection: 'Barcelona',
                                    odds: 2.4,
                                    stake: 50.0,
                                    potentialWinnings: 120.0,
                              },
                              {
                                    betId: 'bet_1705123456793_mno345',
                                    gameId: 'GAME004',
                                    homeTeam: 'Bayern Munich',
                                    awayTeam: 'Borussia Dortmund',
                                    betType: 'Match Winner',
                                    selection: 'Bayern Munich',
                                    odds: 2.5,
                                    stake: 50.0,
                                    potentialWinnings: 125.0,
                              },
                        ],
                        totalStake: 50.0,
                        combinedOdds: 6.0,
                        potentialWinnings: 300.0,
                        taxPercentage: 20.0,
                        taxAmount: 60.0,
                        netWinnings: 240.0,
                        userId: 'user123',
                        timestamp: '2024-01-12T19:30:00Z',
                        status: 'settled',
                        betType: 'multibet',
                        settledAt: '2024-01-13T21:45:00Z',
                        result: 'lost',
                        actualWinnings: 0.0,
                  },
            ];

            // Apply filters if provided
            let filteredSingleBets = mockSingleBets;
            let filteredMultibets = mockMultibets;

            if (filters?.status) {
                  filteredSingleBets = mockSingleBets.filter(bet => bet.status === filters.status);
                  filteredMultibets = mockMultibets.filter(bet => bet.status === filters.status);
            }

            if (filters?.betType) {
                  if (filters.betType === 'single') {
                        filteredMultibets = [];
                  } else if (filters.betType === 'multibet') {
                        filteredSingleBets = [];
                  }
            }

            return {
                  success: true,
                  data: {
                        singleBets: filteredSingleBets,
                        multibets: filteredMultibets,
                        total: filteredSingleBets.length + filteredMultibets.length,
                  },
            };
      }

      // Error handling
      private static handleError(error: any): Error {
            if (error.response) {
                  // Server responded with error status
                  const errorData = error.response.data;
                  return new Error(errorData.error || 'Failed to fetch bet history');
            } else if (error.request) {
                  // Network error
                  return new Error('Network error - please check your connection');
            } else {
                  // Other error
                  return new Error('An unexpected error occurred');
            }
      }
}

// Export convenience functions
export const getUserBets = (filters?: BetHistoryFilters) => BetHistoryService.getUserBets(filters);
export const getBetDetails = (betId: string) => BetHistoryService.getBetDetails(betId);
export const getActiveBets = () => BetHistoryService.getActiveBets();
export const cancelBet = (betId: string, reason?: string) => BetHistoryService.cancelBet(betId, reason);
export const settleBet = (betId: string, result: 'won' | 'lost') => BetHistoryService.settleBet(betId, result);
export const acceptBet = (betId: string) => BetHistoryService.acceptBet(betId);
export const rejectBet = (betId: string, reason: string) => BetHistoryService.rejectBet(betId, reason);
export const getBetStatistics = () => BetHistoryService.getBetStatistics();
export const exportBetHistory = (filters?: BetHistoryFilters) => BetHistoryService.exportBetHistory(filters); 