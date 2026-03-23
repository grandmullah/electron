import { API_BASE_URL } from './apiConfig';
import AuthService from './authService';

export interface PendingPayout {
      id: string;
      ticketId: string;
      betId: string;
      userId: string;
      shopUserId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      reference: string;
      status: string;
      notes: string;
      createdAt: string;
      updatedAt: string;
}

export interface PendingPayoutsResponse {
      success: boolean;
      message: string;
      data: {
            pendingPayouts: PendingPayout[];
            total: number;
      };
}

export interface AllPayoutsResponse {
      success: boolean;
      message: string;
      data: {
            payouts: PendingPayout[];
            pendingPayouts: PendingPayout[];
            completedPayouts: PendingPayout[];
            summary: {
                  total: number;
                  pending: {
                        count: number;
                        totalAmount: number;
                  };
                  completed: {
                        count: number;
                        totalAmount: number;
                  };
            };
            pagination: {
                  limit: number;
                  offset: number;
                  hasMore: boolean;
            };
            shopId: string | null;
      };
}

class PendingPayoutsService {
      private baseUrl = API_BASE_URL;

      private static getAuthToken(): string {
            const token = AuthService.getToken();
            if (!token) {
                  throw new Error('No authentication token available');
            }
            return token;
      }

      async getPendingPayouts(): Promise<PendingPayoutsResponse> {
            try {
                  const token = PendingPayoutsService.getAuthToken();
                  const response = await fetch(`${this.baseUrl}/payout/pending`, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                        },
                  });

                  if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                  }

                  const data: PendingPayoutsResponse = await response.json();
                  return data;
            } catch (error) {
                  console.error('Error fetching pending payouts:', error);
                  throw error;
            }
      }

      /**
       * Get all payouts (pending and completed) for the authenticated shop user
       * GET /api/payout/my-payouts
       */
      async getAllPayouts(): Promise<AllPayoutsResponse> {
            try {
                  const token = PendingPayoutsService.getAuthToken();
                  console.log('🔄 Fetching all payouts (pending & completed)...');

                  const response = await fetch(`${this.baseUrl}/payout/my-payouts`, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                        },
                  });

                  if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                  }

                  const data: AllPayoutsResponse = await response.json();

                  if (data.success) {
                        console.log('✅ All payouts fetched successfully:', {
                              total: data.data.summary.total,
                              pending: data.data.summary.pending,
                              completed: data.data.summary.completed,
                        });
                        return data;
                  } else {
                        throw new Error(data.message || 'Failed to fetch payouts');
                  }
            } catch (error: any) {
                  console.error('❌ Error fetching all payouts:', error);
                  throw new Error(error.message || 'Failed to fetch payouts');
            }
      }

      async getAllPayoutsPaginated(options?: {
            limit?: number;
            offset?: number;
            status?: 'all' | 'pending' | 'completed';
      }): Promise<AllPayoutsResponse> {
            const limit = options?.limit ?? 20;
            const offset = options?.offset ?? 0;
            const status = options?.status ?? 'all';
            const token = PendingPayoutsService.getAuthToken();
            const params = new URLSearchParams({
                  limit: String(limit),
                  offset: String(offset),
            });
            if (status !== 'all') {
                  params.set('status', status);
            }

            const response = await fetch(`${this.baseUrl}/payout/my-payouts?${params.toString()}`, {
                  method: 'GET',
                  headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                  },
            });

            if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
      }
}

export const pendingPayoutsService = new PendingPayoutsService();
