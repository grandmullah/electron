import { apiConfig } from './apiConfig';

export interface RevenueData {
      settledRevenue: number;
      stakesFromLostBets: number;
      stakesFromWinningBets: number;
      note?: string;
}

export interface PayoutBreakdown {
      total: number;
      completed: number;
      pending: number;
      totalCount: number;
      completedCount: number;
      pendingCount: number;
}

export interface ExpensesData {
      netWinningsPaidToUsers: number;
      payoutBreakdown: PayoutBreakdown;
      note?: string;
}

export interface ProfitBreakdown {
      totalRevenue: number;
      lessNetWinningsPaid: number;
      equalsGrossProfit: number;
      lessTaxesToGovernment: number;
      equalsNetProfit: number;
}

export interface ProfitData {
      grossProfit: number;
      netProfit: number;
      profitMargin: number;
      breakdown: ProfitBreakdown;
      note?: string;
}

export interface TaxBreakdown {
      collectedByShop: number;
      pendingCollection: number;
      totalCalculated: number;
      notYetCollected: number;
}

export interface TaxObligations {
      taxesCollectedByShop: number;
      taxesNotYetCollected: number;
      totalTaxesOwedToGovernment: number;
      taxRate: number;
      effectiveTaxCollected: number;
      breakdown: TaxBreakdown;
      note?: string;
}

// Legacy interface for backwards compatibility
export interface TaxData {
      totalTaxCollected: number;
      totalTaxPending: number;
      totalTaxCalculated: number;
      taxRate: number;
      effectiveTaxCollected: number;
      taxBreakdown: TaxBreakdown;
}

export interface PerformanceData {
      totalBets: number;
      totalActiveBets?: number;
      winRate: number;
      averageStake: number;
      averageWinnings: number;
}

export interface PendingBetsData {
      count: number;
      stakesReceived: number;
      note?: string;
}

export interface CancelledBetsData {
      count: number;
      stakesReturned: number;
      note?: string;
}

export interface PeriodData {
      days: number;
      fromDate: string;
      toDate: string;
}

export interface FinancialSummary {
      revenue: RevenueData;
      expenses: ExpensesData;
      profit: ProfitData;
      taxObligations: TaxObligations;
      tax?: TaxData; // Legacy support
      performance: PerformanceData;
      pendingBets?: PendingBetsData;
      cancelledBets?: CancelledBetsData;
      period: PeriodData;
}

export interface FinancialSummaryResponse {
      success: boolean;
      message: string;
      data: FinancialSummary;
      error?: string;
}

class FinancialSummaryService {
      private baseUrl = apiConfig.baseUrl;

      /**
       * Get financial summary for dashboard
       * GET /api/analytics/financial-summary?days=30
       */
      async getFinancialSummary(days: number = 30): Promise<FinancialSummaryResponse> {
            try {
                  console.log(`🔄 Fetching financial summary for ${days} days...`);

                  const token = localStorage.getItem('authToken');
                  if (!token) {
                        throw new Error('No authentication token found. Please log in again.');
                  }

                  console.log('🔑 Using token:', token.substring(0, 20) + '...');

                  const response = await fetch(`${this.baseUrl}/analytics/financial-summary?days=${days}`, {
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
                              localStorage.removeItem('authToken');
                              localStorage.removeItem('authUser');
                              throw new Error('Your session has expired. Please log in again.');
                        }
                        throw new Error(data.message || `HTTP error! status: ${response.status}`);
                  }

                  if (data.success) {
                        console.log('✅ Financial summary fetched successfully:', data.data);
                        return data;
                  } else {
                        throw new Error(data.message || 'Failed to fetch financial summary');
                  }
            } catch (error: any) {
                  console.error('❌ Error fetching financial summary:', error);
                  throw new Error(error.message || 'Failed to fetch financial summary');
            }
      }

      /**
       * Get financial summary for different time periods
       */
      async getFinancialSummaryForPeriods(): Promise<{
            today: FinancialSummary | null;
            thisWeek: FinancialSummary | null;
            thisMonth: FinancialSummary | null;
      }> {
            try {
                  const [today, thisWeek, thisMonth] = await Promise.allSettled([
                        this.getFinancialSummary(1),
                        this.getFinancialSummary(7),
                        this.getFinancialSummary(30)
                  ]);

                  return {
                        today: today.status === 'fulfilled' ? today.value.data : null,
                        thisWeek: thisWeek.status === 'fulfilled' ? thisWeek.value.data : null,
                        thisMonth: thisMonth.status === 'fulfilled' ? thisMonth.value.data : null,
                  };
            } catch (error: any) {
                  console.error('❌ Error fetching financial summary for periods:', error);
                  return {
                        today: null,
                        thisWeek: null,
                        thisMonth: null,
                  };
            }
      }
}

export const financialSummaryService = new FinancialSummaryService();
