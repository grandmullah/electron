import { API_BASE_URL } from './apiConfig';
import AuthService from './authService';

export interface GovernmentTaxPayment {
      id: string;
      shopId: string;
      paymentDate: Date;
      amount: number;
      reference?: string;
      notes?: string;
      paidBy?: string;
      createdAt: Date;
      updatedAt: Date;
}

export interface PendingGovernmentTax {
      shopId: string;
      totalTaxCollected: number;
      totalTaxPaid: number;
      pendingTaxAmount: number;
      lastPaymentDate?: Date;
      eligiblePayoutsCount: number;
}

export interface GovernmentTaxPaymentRequest {
      paymentDate: string; // ISO date string
      amount: number;
      reference?: string;
      notes?: string;
}

export interface GovernmentTaxPaymentResponse {
      success: boolean;
      data: GovernmentTaxPayment;
      message?: string;
}

export interface PendingTaxResponse {
      success: boolean;
      data: PendingGovernmentTax;
      message?: string;
}

export interface PaymentHistoryResponse {
      success: boolean;
      data: {
            payments: GovernmentTaxPayment[];
            pagination: {
                  total: number;
                  limit: number;
                  offset: number;
                  hasMore: boolean;
            };
      };
      message?: string;
}

export interface TaxPaymentSummary {
      totalTaxCollected: number;
      totalTaxPaid: number;
      pendingTaxAmount: number;
      paymentsInPeriod: number;
      totalPaidInPeriod: number;
}

export interface TaxPaymentSummaryResponse {
      success: boolean;
      data: TaxPaymentSummary;
      message?: string;
}

class GovernmentTaxService {
      private baseUrl = API_BASE_URL;

      private getAuthToken(): string {
            const token = AuthService.getToken();
            if (!token) {
                  throw new Error('No authentication token found. Please log in again.');
            }
            return token;
      }

      /**
       * Get pending government taxes for the authenticated shop user
       * GET /api/tax/government/pending
       */
      async getPendingTaxes(asOfDate?: string): Promise<PendingGovernmentTax> {
            try {
                  const token = this.getAuthToken();
                  const url = asOfDate
                        ? `${this.baseUrl}/tax/government/pending?asOfDate=${asOfDate}`
                        : `${this.baseUrl}/tax/government/pending`;

                  const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                        },
                  });

                  if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                  }

                  const data: PendingTaxResponse = await response.json();

                  if (data.success) {
                        return data.data;
                  } else {
                        throw new Error(data.message || 'Failed to fetch pending taxes');
                  }
            } catch (error: any) {
                  console.error('Error fetching pending government taxes:', error);
                  throw new Error(error.message || 'Failed to fetch pending government taxes');
            }
      }

      /**
       * Record a tax payment to the government
       * POST /api/tax/government/pay
       */
      async recordTaxPayment(request: GovernmentTaxPaymentRequest): Promise<GovernmentTaxPayment> {
            try {
                  const token = this.getAuthToken();

                  const response = await fetch(`${this.baseUrl}/tax/government/pay`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(request),
                  });

                  if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                  }

                  const data: GovernmentTaxPaymentResponse = await response.json();

                  if (data.success) {
                        return data.data;
                  } else {
                        throw new Error(data.message || 'Failed to record tax payment');
                  }
            } catch (error: any) {
                  console.error('Error recording government tax payment:', error);
                  throw new Error(error.message || 'Failed to record government tax payment');
            }
      }

      /**
       * Get payment history for the authenticated shop user
       * GET /api/tax/government/history
       */
      async getPaymentHistory(limit: number = 50, offset: number = 0): Promise<{
            payments: GovernmentTaxPayment[];
            pagination: {
                  total: number;
                  limit: number;
                  offset: number;
                  hasMore: boolean;
            };
      }> {
            try {
                  const token = this.getAuthToken();

                  const response = await fetch(
                        `${this.baseUrl}/tax/government/history?limit=${limit}&offset=${offset}`,
                        {
                              method: 'GET',
                              headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                              },
                        }
                  );

                  if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                  }

                  const data: PaymentHistoryResponse = await response.json();

                  if (data.success) {
                        return data.data;
                  } else {
                        throw new Error(data.message || 'Failed to fetch payment history');
                  }
            } catch (error: any) {
                  console.error('Error fetching government tax payment history:', error);
                  throw new Error(error.message || 'Failed to fetch payment history');
            }
      }

      /**
       * Get tax payment summary for analytics
       * GET /api/tax/government/summary
       */
      async getTaxPaymentSummary(days: number = 30): Promise<TaxPaymentSummary> {
            try {
                  const token = this.getAuthToken();

                  const response = await fetch(`${this.baseUrl}/tax/government/summary?days=${days}`, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                        },
                  });

                  if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                  }

                  const data: TaxPaymentSummaryResponse = await response.json();

                  if (data.success) {
                        return data.data;
                  } else {
                        throw new Error(data.message || 'Failed to fetch tax payment summary');
                  }
            } catch (error: any) {
                  console.error('Error fetching tax payment summary:', error);
                  throw new Error(error.message || 'Failed to fetch tax payment summary');
            }
      }
}

export const governmentTaxService = new GovernmentTaxService();
export default governmentTaxService;

