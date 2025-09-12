import { apiConfig } from './apiConfig';

export interface PayoutStats {
      totalPayouts: number;
      totalAmount: number;
      pendingPayouts: number;
      completedPayouts: number;
      cancelledPayouts: number;
      failedPayouts: number;
      averageAmount: number;
}

export interface PayoutSummary {
      today: PayoutStats;
      thisWeek: PayoutStats;
      thisMonth: PayoutStats;
      pending: {
            count: number;
            totalAmount: number;
      };
}

export interface PayoutSummaryResponse {
      success: boolean;
      message: string;
      data: {
            summary: PayoutSummary;
      };
      error?: string;
}

class PayoutSummaryService {
      private baseUrl = apiConfig.baseUrl;

      /**
       * Get payout summary for dashboard
       * GET /api/payout/summary
       */
      async getPayoutSummary(): Promise<PayoutSummaryResponse> {
            try {
                  console.log('🔄 Fetching payout summary...');

                  const token = localStorage.getItem('token');
                  if (!token) {
                        throw new Error('No authentication token found. Please log in again.');
                  }

                  console.log('🔑 Using token:', token.substring(0, 20) + '...');

                  const response = await fetch(`${this.baseUrl}/payout/summary`, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                        },
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        console.error('❌ API Error Response:', data);
                        if (data.error === 'Invalid or expired token') {
                              // Clear invalid token and redirect to login
                              localStorage.removeItem('token');
                              localStorage.removeItem('user');
                              throw new Error('Your session has expired. Please log in again.');
                        }
                        throw new Error(data.message || `HTTP error! status: ${response.status}`);
                  }

                  if (data.success) {
                        console.log('✅ Payout summary fetched successfully:', data.data.summary);
                        return data;
                  } else {
                        throw new Error(data.message || 'Failed to fetch payout summary');
                  }
            } catch (error: any) {
                  console.error('❌ Error fetching payout summary:', error);
                  throw new Error(error.message || 'Failed to fetch payout summary');
            }
      }

      /**
       * Get pending payouts for the authenticated shop user
       * GET /api/payout/pending
       */
      async getPendingPayouts(): Promise<{
            success: boolean;
            message: string;
            data: {
                  pendingPayouts: any[];
                  total: number;
            };
      }> {
            try {
                  console.log('🔄 Fetching pending payouts...');

                  const response = await fetch(`${this.baseUrl}/payout/pending`, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                  });

                  if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                  }

                  const data = await response.json();

                  if (data.success) {
                        console.log('✅ Pending payouts fetched successfully:', data.data.pendingPayouts.length);
                        return data;
                  } else {
                        throw new Error(data.message || 'Failed to fetch pending payouts');
                  }
            } catch (error: any) {
                  console.error('❌ Error fetching pending payouts:', error);
                  throw new Error(error.message || 'Failed to fetch pending payouts');
            }
      }

      /**
       * Get completed payouts for the authenticated shop user
       * GET /api/payout/completed
       */
      async getCompletedPayouts(limit: number = 100, offset: number = 0): Promise<{
            success: boolean;
            message: string;
            data: {
                  completedPayouts: any[];
                  total: number;
                  limit: number;
                  offset: number;
                  hasMore: boolean;
            };
      }> {
            try {
                  console.log('🔄 Fetching completed payouts...');

                  const response = await fetch(`${this.baseUrl}/payout/completed?limit=${limit}&offset=${offset}`, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                  });

                  if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                  }

                  const data = await response.json();

                  if (data.success) {
                        console.log('✅ Completed payouts fetched successfully:', data.data.completedPayouts.length);
                        return data;
                  } else {
                        throw new Error(data.message || 'Failed to fetch completed payouts');
                  }
            } catch (error: any) {
                  console.error('❌ Error fetching completed payouts:', error);
                  throw new Error(error.message || 'Failed to fetch completed payouts');
            }
      }
}

export const payoutSummaryService = new PayoutSummaryService();
