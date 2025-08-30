import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import AuthService from './authService';

// Types for statistics API
export interface PersonalStatistics {
      totalBets: number;
      totalStake: number;
      totalWinnings: number;
      totalLosses: number;
      winRate: number;
      averageOdds: number;
      averageStake: number;
      bestWin: number;
      worstLoss: number;
      totalTaxPaid: number;
      netProfit: number;
      betBreakdown: {
            singleBets: number;
            multibets: number;
            pending: number;
            accepted: number;
            settled: number;
            cancelled: number;
            won: number;
            lost: number;
      };
      monthlyStats: Array<{
            month: string;
            bets: number;
            stake: number;
            winnings: number;
            profit: number;
      }>;
}

export interface ShopStatistics {
      shopInfo: {
            id: string;
            shopName: string;
            shopCode: string;
      };
      totalBets: number;
      totalStake: number;
      totalWinnings: number;
      totalLosses: number;
      totalTaxCollected: number;
      netProfit: number;
      activeUsers: number;
      averageBetSize: number;
      betBreakdown: {
            singleBets: number;
            multibets: number;
            pending: number;
            accepted: number;
            settled: number;
            cancelled: number;
            won: number;
            lost: number;
      };
      userBreakdown: Array<{
            userId: string;
            phoneNumber: string;
            totalBets: number;
            totalStake: number;
            totalWinnings: number;
            winRate: number;
            lastBetDate: string;
      }>;
      monthlyStats: Array<{
            month: string;
            bets: number;
            stake: number;
            winnings: number;
            profit: number;
            users: number;
      }>;
}

export interface DashboardStatistics {
      personal: PersonalStatistics;
      shop: ShopStatistics | null;
      summary: {
            totalBets: number;
            totalStake: number;
            totalWinnings: number;
            netProfit: number;
            winRate: number;
            shopName: string | null;
            shopTotalBets: number;
            shopTotalStake: number;
      };
}

export interface StatisticsFilters {
      startDate?: string;
      endDate?: string;
      betType?: 'single' | 'multibet' | 'all';
      status?: 'pending' | 'accepted' | 'rejected' | 'settled' | 'cancelled' | 'all';
      shopId?: string;
}

export class StatisticsService {
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

      private static handleError(error: any): Error {
            console.error('Statistics service error:', error);

            if (error.response) {
                  // Server responded with error status
                  const status = error.response.status;
                  const message = error.response.data?.message || error.response.data?.error;

                  switch (status) {
                        case 401:
                              return new Error('Authentication failed. Please log in again.');
                        case 403:
                              return new Error('Access denied. Insufficient permissions.');
                        case 404:
                              return new Error('Statistics not found.');
                        case 500:
                              return new Error('Server error. Please try again later.');
                        default:
                              return new Error(message || `Request failed with status ${status}`);
                  }
            } else if (error.request) {
                  // Network error
                  if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                        return new Error('Unable to connect to server. Please ensure the backend server is running.');
                  }
                  return new Error('Network error. Please check your connection.');
            } else {
                  // Other error
                  return new Error(error.message || 'An unexpected error occurred');
            }
      }

      // Get personal statistics for the authenticated user
      static async getPersonalStatistics(filters?: StatisticsFilters): Promise<PersonalStatistics> {
            try {
                  const token = this.getAuthToken();
                  const userId = this.getUserId();

                  // Build query parameters
                  const queryParams = new URLSearchParams();
                  if (filters?.startDate) {
                        queryParams.append('startDate', filters.startDate);
                  }
                  if (filters?.endDate) {
                        queryParams.append('endDate', filters.endDate);
                  }
                  if (filters?.betType && filters.betType !== 'all') {
                        queryParams.append('betType', filters.betType);
                  }
                  if (filters?.status && filters.status !== 'all') {
                        queryParams.append('status', filters.status);
                  }

                  const url = `${API_BASE_URL}/statistics/personal${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                  console.log('Fetching personal statistics from:', url);

                  const response = await axios.get(url, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Get shop statistics (for agents/admins)
      static async getShopStatistics(shopId: string, filters?: StatisticsFilters): Promise<ShopStatistics> {
            try {
                  const token = this.getAuthToken();

                  // Build query parameters
                  const queryParams = new URLSearchParams();
                  if (filters?.startDate) {
                        queryParams.append('startDate', filters.startDate);
                  }
                  if (filters?.endDate) {
                        queryParams.append('endDate', filters.endDate);
                  }

                  const url = `${API_BASE_URL}/statistics/shop/${shopId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                  console.log('Fetching shop statistics from:', url);

                  const response = await axios.get(url, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Get comprehensive dashboard statistics
      static async getDashboardStatistics(shopId?: string): Promise<DashboardStatistics> {
            try {
                  const token = this.getAuthToken();

                  // Build query parameters
                  const queryParams = new URLSearchParams();
                  if (shopId) {
                        queryParams.append('shopId', shopId);
                  }

                  const url = `${API_BASE_URL}/statistics/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                  console.log('Fetching dashboard statistics from:', url);

                  const response = await axios.get(url, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Get statistics summary
      static async getStatisticsSummary(shopId?: string): Promise<any> {
            try {
                  const token = this.getAuthToken();

                  // Build query parameters
                  const queryParams = new URLSearchParams();
                  if (shopId) {
                        queryParams.append('shopId', shopId);
                  }

                  const url = `${API_BASE_URL}/statistics/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                  console.log('Fetching statistics summary from:', url);

                  const response = await axios.get(url, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Get monthly statistics for charts
      static async getMonthlyStatistics(shopId?: string, year?: number): Promise<any> {
            try {
                  const token = this.getAuthToken();

                  // Build query parameters
                  const queryParams = new URLSearchParams();
                  if (shopId) {
                        queryParams.append('shopId', shopId);
                  }
                  if (year) {
                        queryParams.append('year', year.toString());
                  }

                  const url = `${API_BASE_URL}/statistics/monthly${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

                  console.log('Fetching monthly statistics from:', url);

                  const response = await axios.get(url, {
                        headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                  });

                  return response.data.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }
}

export default StatisticsService;
