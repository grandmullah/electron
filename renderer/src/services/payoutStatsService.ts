import { API_BASE_URL } from './apiConfig';
import AuthService from './authService';

export interface PayoutStatistics {
      totalPayouts: number;
      pendingPayouts: number;
      completedPayouts: number;
      cancelledPayouts: number;
      failedPayouts: number;
      totalAmount: number;
      averageAmount: number;
      firstPayout: string | null;
      lastPayout: string | null;
}

export interface PayoutStatsResponse {
      success: boolean;
      message: string;
      data: {
            shopUserId: string;
            period: string;
            statistics: PayoutStatistics;
      };
}

class PayoutStatsService {
      private baseUrl = API_BASE_URL;

      private static getAuthToken(): string {
            const token = AuthService.getToken();
            if (!token) {
                  throw new Error('No authentication token available');
            }
            return token;
      }

      async getPayoutStats(shopUserId: string): Promise<PayoutStatsResponse> {
            try {
                  const token = PayoutStatsService.getAuthToken();
                  const response = await fetch(`${this.baseUrl}/payout/stats/${shopUserId}`, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                        },
                  });

                  if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                  }

                  const data: PayoutStatsResponse = await response.json();
                  return data;
            } catch (error) {
                  console.error('Error fetching payout statistics:', error);
                  throw error;
            }
      }
}

export const payoutStatsService = new PayoutStatsService();
