import { useState, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { financialSummaryService, FinancialSummary } from '../services/financialSummaryService';

export const useFinancialSummary = () => {
      const { user } = useAppSelector((state) => state.auth);

      const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
      const [isLoadingFinancialSummary, setIsLoadingFinancialSummary] = useState(false);
      const [financialSummaryError, setFinancialSummaryError] = useState<string | null>(null);
      const [periodSummaries, setPeriodSummaries] = useState<{
            today: FinancialSummary | null;
            thisWeek: FinancialSummary | null;
            thisMonth: FinancialSummary | null;
      }>({
            today: null,
            thisWeek: null,
            thisMonth: null,
      });
      const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);
      const [periodsError, setPeriodsError] = useState<string | null>(null);

      const loadFinancialSummary = useCallback(async (days: number = 30) => {
            if (!user?.id) return;

            setIsLoadingFinancialSummary(true);
            setFinancialSummaryError(null);

            try {
                  console.log(`🔄 Loading financial summary for ${days} days...`);
                  const response = await financialSummaryService.getFinancialSummary(days);

                  if (response.success && response.data) {
                        setFinancialSummary(response.data);
                        console.log('✅ Financial summary loaded:', response.data);
                  } else {
                        setFinancialSummary(null);
                  }
            } catch (error: any) {
                  console.error('❌ Error loading financial summary:', error);
                  const errorMessage = error.message || 'Failed to load financial summary';
                  setFinancialSummaryError(errorMessage);
                  setFinancialSummary(null);

                  // If it's an authentication error, we might want to trigger a re-login
                  if (errorMessage.includes('session has expired') || errorMessage.includes('log in again')) {
                        // You could dispatch an action to clear the auth state here
                        console.log('🔐 Authentication error detected, user should re-login');
                  }
            } finally {
                  setIsLoadingFinancialSummary(false);
            }
      }, [user?.id]);

      const loadFinancialSummaryForPeriods = useCallback(async () => {
            if (!user?.id) return;

            setIsLoadingPeriods(true);
            setPeriodsError(null);

            try {
                  console.log('🔄 Loading financial summary for all periods...');
                  const summaries = await financialSummaryService.getFinancialSummaryForPeriods();
                  setPeriodSummaries(summaries);
                  console.log('✅ Financial summary for periods loaded:', summaries);
            } catch (error: any) {
                  console.error('❌ Error loading financial summary for periods:', error);
                  setPeriodsError(error.message || 'Failed to load financial summary for periods');
                  setPeriodSummaries({
                        today: null,
                        thisWeek: null,
                        thisMonth: null,
                  });
            } finally {
                  setIsLoadingPeriods(false);
            }
      }, [user?.id]);

      // Helper function to get formatted currency amount
      const formatCurrency = (amount: number): string => {
            return `SSP ${amount.toFixed(2)}`;
      };

      // Helper function to get percentage change
      const getPercentageChange = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
      };

      // Helper function to get trend direction
      const getTrendDirection = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
            const change = getPercentageChange(current, previous);
            if (change > 5) return 'up';
            if (change < -5) return 'down';
            return 'neutral';
      };

      // Helper function to get profit margin color
      const getProfitMarginColor = (margin: number): string => {
            if (margin > 20) return 'success.main';
            if (margin > 10) return 'warning.main';
            return 'error.main';
      };

      // Helper function to get win rate color
      const getWinRateColor = (winRate: number): string => {
            if (winRate > 50) return 'success.main';
            if (winRate > 30) return 'warning.main';
            return 'error.main';
      };

      // Financial Analysis Helpers - specific calculations for business metrics
      const getFinancialAnalysis = (summary: FinancialSummary | null) => {
            if (!summary) {
                  return {
                        totalRevenue: 0,
                        actualExpenses: 0,
                        netProfit: 0,
                        taxCollected: 0,
                        formattedTotalRevenue: formatCurrency(0),
                        formattedActualExpenses: formatCurrency(0),
                        formattedNetProfit: formatCurrency(0),
                        formattedTaxCollected: formatCurrency(0),
                  };
            }

            // Total Revenue: stakes from lost bets + tax
            const totalRevenue = summary.revenue.stakesKeptFromLostBets + summary.tax.totalTaxCollected;

            // Actual Expenses: net winnings paid to users
            const actualExpenses = summary.expenses.actualWinningsPaid;

            // Net Profit: Total Revenue - Actual Expenses
            const netProfit = totalRevenue - actualExpenses;

            // Tax Collected: kept by house
            const taxCollected = summary.tax.totalTaxCollected;

            return {
                  totalRevenue,
                  actualExpenses,
                  netProfit,
                  taxCollected,
                  formattedTotalRevenue: formatCurrency(totalRevenue),
                  formattedActualExpenses: formatCurrency(actualExpenses),
                  formattedNetProfit: formatCurrency(netProfit),
                  formattedTaxCollected: formatCurrency(taxCollected),
            };
      };

      return {
            // Data
            financialSummary,
            periodSummaries,

            // Loading states
            isLoadingFinancialSummary,
            isLoadingPeriods,

            // Error states
            financialSummaryError,
            periodsError,

            // Actions
            loadFinancialSummary,
            loadFinancialSummaryForPeriods,

            // Helper functions
            formatCurrency,
            getPercentageChange,
            getTrendDirection,
            getProfitMarginColor,
            getWinRateColor,
            getFinancialAnalysis,
      };
};
