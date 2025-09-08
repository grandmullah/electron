import { API_BASE_URL } from './apiConfig';
import AuthService from './authService';

export interface PayoutRequest {
      ticketId: string;
      betId: string;
      userId: string;
      amount: number;
      currency: string; // Required field
      paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'card' | 'check';
      reference: string;
      notes?: string;
}

export interface PayoutResponse {
      success: boolean;
      payoutId?: string;
      message: string;
      errors?: string[];
      data?: {
            payoutId: string;
            ticketId: string;
            amount: number;
            paymentMethod: string;
            reference: string;
            status: string;
            processedAt?: string;
      };
}

export interface PayoutValidationRequest {
      ticketId: string;
      betId: string;
      userId: string;
      amount: number;
      currency?: string;
      paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'card' | 'check';
      reference: string;
      notes?: string;
}

export interface PayoutValidationResponse {
      success: boolean;
      message: string;
      errors?: string[];
      data?: {
            isValid: boolean;
            warnings: string[];
            recommendations: string[];
            betValidation?: {
                  betExists: boolean;
                  betStatus: string;
                  betSettled: boolean;
                  hasExistingPayout: boolean;
                  amountMatches: boolean;
            };
            userValidation?: {
                  userExists: boolean;
                  userActive: boolean;
                  hasValidAccount: boolean;
            };
            payoutValidation?: {
                  noDuplicatePayout: boolean;
                  amountValid: boolean;
                  paymentMethodValid: boolean;
            };
      };
}

export interface PayoutStats {
      totalPayouts: number;
      totalAmount: number;
      pendingPayouts: number;
      completedPayouts: number;
      failedPayouts: number;
      averagePayoutAmount: number;
      topPaymentMethods: Array<{
            method: string;
            count: number;
            amount: number;
      }>;
}

export interface PayoutSummary {
      totalPayouts: number;
      totalAmount: number;
      pendingAmount: number;
      completedAmount: number;
      failedAmount: number;
      todayPayouts: number;
      todayAmount: number;
}

export interface Payout {
      id: string;
      ticketId: string;
      betId: string;
      userId: string;
      shopUserId: string;
      amount: number;
      paymentMethod: string;
      reference: string;
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
      notes?: string;
      processedAt?: string;
      created_at: string;
      updated_at: string;
}

export interface PayoutFilters {
      shopUserId?: string;
      status?: string;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
      minAmount?: number;
      maxAmount?: number;
      userId?: string;
}

class PayoutService {
      private baseUrl: string;

      constructor() {
            this.baseUrl = `${API_BASE_URL}/payout`;
      }

      /**
       * Validate a payout request before processing
       */
      async validatePayout(payoutRequest: PayoutValidationRequest): Promise<PayoutValidationResponse> {
            try {
                  const response = await fetch(`${this.baseUrl}/validate`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
                        body: JSON.stringify(payoutRequest),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to validate payout');
                  }

                  return data;
            } catch (error: any) {
                  console.error('Error validating payout:', error);
                  throw new Error(error.message || 'Failed to validate payout');
            }
      }

      /**
       * Process a payout for a winning ticket
       */
      async processPayout(payoutRequest: PayoutRequest): Promise<PayoutResponse> {
            try {
                  const response = await fetch(`${this.baseUrl}/process`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
                        body: JSON.stringify(payoutRequest),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to process payout');
                  }

                  return data;
            } catch (error: any) {
                  console.error('Error processing payout:', error);
                  throw new Error(error.message || 'Failed to process payout');
            }
      }

      /**
       * Get payout history for a user
       */
      async getUserPayoutHistory(userId: string, limit: number = 50): Promise<Payout[]> {
            try {
                  const response = await fetch(`${this.baseUrl}/history/${userId}?limit=${limit}`, {
                        method: 'GET',
                        headers: {
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to get payout history');
                  }

                  return data.payouts || [];
            } catch (error: any) {
                  console.error('Error getting payout history:', error);
                  throw new Error(error.message || 'Failed to get payout history');
            }
      }

      /**
       * Get payout by ID
       */
      async getPayoutById(payoutId: string): Promise<Payout | null> {
            try {
                  const response = await fetch(`${this.baseUrl}/${payoutId}`, {
                        method: 'GET',
                        headers: {
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to get payout');
                  }

                  return data.payout || null;
            } catch (error: any) {
                  console.error('Error getting payout:', error);
                  throw new Error(error.message || 'Failed to get payout');
            }
      }

      /**
       * Get payouts with filters
       */
      async getPayouts(filters: PayoutFilters, limit: number = 50, offset: number = 0): Promise<Payout[]> {
            try {
                  const queryParams = new URLSearchParams();
                  queryParams.append('limit', limit.toString());
                  queryParams.append('offset', offset.toString());

                  Object.entries(filters).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                              queryParams.append(key, value.toString());
                        }
                  });

                  const response = await fetch(`${this.baseUrl}/list?${queryParams.toString()}`, {
                        method: 'GET',
                        headers: {
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to get payouts');
                  }

                  return data.payouts || [];
            } catch (error: any) {
                  console.error('Error getting payouts:', error);
                  throw new Error(error.message || 'Failed to get payouts');
            }
      }

      /**
       * Complete a payout
       */
      async completePayout(payoutId: string, notes?: string): Promise<PayoutResponse> {
            try {
                  const token = AuthService.getToken();
                  if (!token) {
                        throw new Error('No authentication token available');
                  }

                  const response = await fetch(`${API_BASE_URL}/payout/complete/${payoutId}`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ notes }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to complete payout');
                  }

                  return data;
            } catch (error: any) {
                  console.error('Error completing payout:', error);
                  throw new Error(error.message || 'Failed to complete payout');
            }
      }

      /**
       * Cancel a payout
       */
      async cancelPayout(payoutId: string, reason: string): Promise<PayoutResponse> {
            try {
                  const response = await fetch(`${this.baseUrl}/cancel/${payoutId}`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
                        body: JSON.stringify({ reason }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to cancel payout');
                  }

                  return data;
            } catch (error: any) {
                  console.error('Error cancelling payout:', error);
                  throw new Error(error.message || 'Failed to cancel payout');
            }
      }

      /**
       * Get pending payouts
       */
      async getPendingPayouts(): Promise<Payout[]> {
            try {
                  const response = await fetch(`${this.baseUrl}/pending`, {
                        method: 'GET',
                        headers: {
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to get pending payouts');
                  }

                  return data.payouts || [];
            } catch (error: any) {
                  console.error('Error getting pending payouts:', error);
                  throw new Error(error.message || 'Failed to get pending payouts');
            }
      }

      /**
       * Get payout statistics for a shop user
       */
      async getPayoutStats(shopUserId: string): Promise<PayoutStats> {
            try {
                  const response = await fetch(`${this.baseUrl}/stats/${shopUserId}`, {
                        method: 'GET',
                        headers: {
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to get payout statistics');
                  }

                  return data.stats || {};
            } catch (error: any) {
                  console.error('Error getting payout statistics:', error);
                  throw new Error(error.message || 'Failed to get payout statistics');
            }
      }

      /**
       * Get payout summary
       */
      async getPayoutSummary(): Promise<PayoutSummary> {
            try {
                  const response = await fetch(`${this.baseUrl}/summary`, {
                        method: 'GET',
                        headers: {
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to get payout summary');
                  }

                  return data.summary || {};
            } catch (error: any) {
                  console.error('Error getting payout summary:', error);
                  throw new Error(error.message || 'Failed to get payout summary');
            }
      }
}

// Export singleton instance
export const payoutService = new PayoutService();

// Export static methods for backward compatibility
export const {
      validatePayout,
      processPayout,
      getUserPayoutHistory,
      getPayoutById,
      getPayouts,
      completePayout,
      cancelPayout,
      getPendingPayouts,
      getPayoutStats,
      getPayoutSummary,
} = payoutService;
