import { useState, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { payoutStatsService, PayoutStatistics } from '../services/payoutStatsService';

export const usePayoutStats = () => {
      const { user } = useAppSelector((state) => state.auth);

      const [payoutStats, setPayoutStats] = useState<PayoutStatistics | null>(null);
      const [isLoadingStats, setIsLoadingStats] = useState(false);
      const [statsError, setStatsError] = useState<string | null>(null);

      const loadPayoutStats = useCallback(async () => {
            if (!user?.id) {
                  setStatsError('User ID not available');
                  return;
            }

            setIsLoadingStats(true);
            setStatsError(null);

            try {
                  console.log('🔄 Loading payout statistics for user:', user.id);

                  const response = await payoutStatsService.getPayoutStats(user.id);

                  if (response.success && response.data) {
                        console.log('✅ Payout statistics loaded:', response.data.statistics);
                        setPayoutStats(response.data.statistics);
                  } else {
                        throw new Error(response.message || 'Failed to load payout statistics');
                  }
            } catch (error: any) {
                  console.error('❌ Error loading payout statistics:', error);
                  setStatsError(error.message || 'Failed to load payout statistics');
            } finally {
                  setIsLoadingStats(false);
            }
      }, [user?.id]);

      return {
            payoutStats,
            isLoadingStats,
            statsError,
            loadPayoutStats,
      };
};
