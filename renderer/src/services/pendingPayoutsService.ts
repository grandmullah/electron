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
}

export const pendingPayoutsService = new PendingPayoutsService();
