import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import AuthService from './authService';
import {
      DisplayBet,
      ShopInfo,
      UserInfo,
      ShopSummary,
      PaymentStatus,
      NewBetHistoryResponse
} from '../types/history';

// Types for bet history API

export interface BetHistoryFilters {
      status?: 'pending' | 'accepted' | 'rejected' | 'settled' | 'cancelled';
      betType?: 'single' | 'multibet';
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
      includeShopBets?: boolean;
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


      // Fetch user bet history
      static async getUserBets(filters?: BetHistoryFilters): Promise<NewBetHistoryResponse> {
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
                  if (filters?.includeShopBets) {
                        queryParams.append('includeShopBets', 'true');
                  }

                  const url = `${API_BASE_URL}/bets/history/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                  console.log('Fetching user bets (new structure) from:', url);

                  const response = await axios.get(url, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000, // 10 second timeout
                  });

                  // Debug the actual API response
                  console.log('Raw API response:', response.data);
                  console.log('Response structure:', {
                        success: response.data?.success,
                        hasData: !!response.data?.data,
                        singleBets: response.data?.data?.singleBets,
                        multibets: response.data?.data?.multibets,
                        total: response.data?.data?.total
                  });

                  // Transform the response to match our DisplayBet interface
                  const transformedData = this.transformBetHistoryResponse(response.data);
                  return transformedData;
            } catch (error: any) {
                  console.error('Error fetching user bets (new structure):', error);

                  // Return empty response for development/offline mode
                  if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
                        console.log('Development mode: returning empty bet history');
                        return {
                              success: true,
                              data: {
                                    singleBets: [],
                                    multibets: [],
                                    total: 0
                              }
                        };
                  }

                  throw this.handleError(error);
            }
      }


      // Transform new API response to DisplayBet format
      private static transformBetHistoryResponse(apiResponse: any): NewBetHistoryResponse {
            console.log('Transforming API response:', apiResponse);

            // Ensure we have the expected structure
            if (!apiResponse || !apiResponse.data) {
                  console.warn('Invalid API response structure:', apiResponse);
                  return {
                        success: false,
                        data: {
                              singleBets: [],
                              multibets: [],
                              total: 0
                        }
                  };
            }

            const singleBetsArray = Array.isArray(apiResponse.data.singleBets) ? apiResponse.data.singleBets : [];
            const multibetsArray = Array.isArray(apiResponse.data.multibets) ? apiResponse.data.multibets : [];

            console.log('Processing arrays:', {
                  singleBetsCount: singleBetsArray.length,
                  multibetsCount: multibetsArray.length
            });

            const transformedSingleBets: DisplayBet[] = singleBetsArray.map((bet: any) => {
                  const betId = bet.betId;

                  // Transform selections array - only map fields that exist in the API response
                  const transformedSelections = bet.selections.map((selection: any) => ({
                        selectionId: selection.selectionId,
                        betId: betId, // Parent bet ID
                        gameId: selection.gameId,
                        homeTeam: selection.homeTeam,
                        awayTeam: selection.awayTeam,
                        betType: selection.betType,
                        selection: selection.selection,
                        gameScore: selection.gameScore,
                        // Only include odds, stake, potentialWinnings if they exist in the selection object
                        ...(selection.odds !== undefined && { odds: selection.odds }),
                        ...(selection.stake !== undefined && { stake: selection.stake }),
                        ...(selection.potentialWinnings !== undefined && { potentialWinnings: selection.potentialWinnings }),
                        ...(selection.result !== undefined && { result: selection.result })
                  }));

                  return {
                        betId,
                        betType: 'single' as const,
                        totalStake: bet.totalStake,
                        potentialWinnings: bet.potentialWinnings,
                        actualWinnings: bet.actualWinnings,
                        createdAt: bet.timestamp,
                        settledAt: bet.settledAt,
                        status: bet.status,
                        result: bet.result,
                        selections: transformedSelections,
                        taxPercentage: bet.taxPercentage,
                        taxAmount: bet.taxAmount,
                        netWinnings: bet.netWinnings,
                        paymentStatus: bet.paymentStatus,
                        shop: bet.shop,
                        user: bet.user,
                        combinedOdds: bet.combinedOdds
                  };
            });

            const transformedMultibets: DisplayBet[] = multibetsArray.map((bet: any) => {
                  const betId = bet.betId;

                  return {
                        betId,
                        betType: 'multibet' as const,
                        totalStake: bet.totalStake,
                        potentialWinnings: bet.potentialWinnings,
                        actualWinnings: bet.actualWinnings,
                        createdAt: bet.timestamp,
                        settledAt: bet.settledAt,
                        status: bet.status,
                        result: bet.result,
                        selections: bet.selections.map((selection: any) => ({
                              selectionId: selection.selectionId,
                              betId: betId, // Parent bet ID
                              gameId: selection.gameId,
                              homeTeam: selection.homeTeam,
                              awayTeam: selection.awayTeam,
                              betType: selection.betType,
                              selection: selection.selection,
                              gameScore: selection.gameScore,
                              // Only include odds, stake, potentialWinnings if they exist in the selection object
                              ...(selection.odds !== undefined && { odds: selection.odds }),
                              ...(selection.stake !== undefined && { stake: selection.stake }),
                              ...(selection.potentialWinnings !== undefined && { potentialWinnings: selection.potentialWinnings }),
                              ...(selection.result !== undefined && { result: selection.result })
                        })),
                        taxPercentage: bet.taxPercentage,
                        taxAmount: bet.taxAmount,
                        netWinnings: bet.netWinnings,
                        paymentStatus: bet.paymentStatus,
                        shop: bet.shop,
                        user: bet.user,
                        combinedOdds: bet.combinedOdds
                  };
            });

            return {
                  success: apiResponse.success,
                  data: {
                        singleBets: transformedSingleBets,
                        multibets: transformedMultibets,
                        total: apiResponse.data.total
                  }
            };
      }

      // Get individual bet details
      static async getBetDetails(betId: string): Promise<any> {
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
      static async getActiveBets(): Promise<NewBetHistoryResponse> {
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

                  // Return empty response for development/offline mode
                  if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
                        console.log('Development mode: returning empty active bets');
                        return {
                              success: true,
                              data: {
                                    singleBets: [],
                                    multibets: [],
                                    total: 0
                              }
                        };
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

                  // Return the error response if available
                  if (error.response?.data) {
                        return error.response.data;
                  }

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