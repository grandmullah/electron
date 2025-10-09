import { useState, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { payoutSummaryService, PayoutSummary, PayoutStats } from '../services/payoutSummaryService';

export const usePayoutSummary = () => {
      const { user } = useAppSelector((state) => state.auth);

      const [payoutSummary, setPayoutSummary] = useState<PayoutSummary | null>(null);
      const [isLoadingSummary, setIsLoadingSummary] = useState(false);
      const [summaryError, setSummaryError] = useState<string | null>(null);
      const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
      const [completedPayouts, setCompletedPayouts] = useState<any[]>([]);
      const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);
      const [payoutsError, setPayoutsError] = useState<string | null>(null);

      const loadPayoutSummary = useCallback(async () => {
            if (!user?.id) return;

            setIsLoadingSummary(true);
            setSummaryError(null);

            try {
                  console.log("🔄 Loading payout summary...");
                  const response = await payoutSummaryService.getPayoutSummary();

                  if (response.success && response.data) {
                        setPayoutSummary(response.data.summary);
                        console.log("✅ Payout summary loaded:", response.data.summary);
                  } else {
                        setPayoutSummary(null);
                  }
            } catch (error: any) {
                  console.error("❌ Error loading payout summary:", error);
                  setSummaryError(error.message || "Failed to load payout summary");
                  setPayoutSummary(null);
            } finally {
                  setIsLoadingSummary(false);
            }
      }, [user?.id]);

      const loadPendingPayouts = useCallback(async () => {
            if (!user?.id) return;

            setIsLoadingPayouts(true);
            setPayoutsError(null);

            try {
                  console.log("🔄 Loading pending payouts...");
                  const response = await payoutSummaryService.getPendingPayouts();

                  if (response.success && response.data) {
                        setPendingPayouts(response.data.pendingPayouts);
                        console.log("✅ Pending payouts loaded:", response.data.pendingPayouts.length);
                  } else {
                        setPendingPayouts([]);
                  }
            } catch (error: any) {
                  console.error("❌ Error loading pending payouts:", error);
                  setPayoutsError(error.message || "Failed to load pending payouts");
                  setPendingPayouts([]);
            } finally {
                  setIsLoadingPayouts(false);
            }
      }, [user?.id]);

      const loadCompletedPayouts = useCallback(async (limit: number = 100, offset: number = 0) => {
            if (!user?.id) return;

            setIsLoadingPayouts(true);
            setPayoutsError(null);

            try {
                  console.log("🔄 Loading completed payouts...");
                  const response = await payoutSummaryService.getCompletedPayouts(limit, offset);

                  if (response.success && response.data) {
                        setCompletedPayouts(response.data.completedPayouts);
                        console.log("✅ Completed payouts loaded:", response.data.completedPayouts.length);
                  } else {
                        setCompletedPayouts([]);
                  }
            } catch (error: any) {
                  console.error("❌ Error loading completed payouts:", error);
                  setPayoutsError(error.message || "Failed to load completed payouts");
                  setCompletedPayouts([]);
            } finally {
                  setIsLoadingPayouts(false);
            }
      }, [user?.id]);

      // Helper function to get formatted currency amount
      const formatCurrency = (amount: number): string => {
            return `SSP ${(amount || 0).toFixed(2)}`;
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

      return {
            // Data
            payoutSummary,
            pendingPayouts,
            completedPayouts,

            // Loading states
            isLoadingSummary,
            isLoadingPayouts,

            // Error states
            summaryError,
            payoutsError,

            // Actions
            loadPayoutSummary,
            loadPendingPayouts,
            loadCompletedPayouts,

            // Helper functions
            formatCurrency,
            getPercentageChange,
            getTrendDirection,
      };
};
