import { useState, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { BetHistoryService } from '../services/betHistoryService';

export const useBetsData = () => {
      const { user } = useAppSelector((state) => state.auth);

      const [recentBets, setRecentBets] = useState<any[]>([]);
      const [isLoadingBets, setIsLoadingBets] = useState(false);
      const [betsError, setBetsError] = useState<string | null>(null);

      const loadRecentBets = useCallback(async (options?: { days?: number | null }) => {
            if (!user?.id) return;

            setIsLoadingBets(true);
            setBetsError(null);

            const days = options?.days ?? null;

            try {
                  console.log("🔄 Loading recent bets...", days != null ? `last ${days} days` : "all");

                  const filters: Parameters<typeof BetHistoryService.getUserBets>[0] = {
                        includeShopBets: true,
                        limit: 200,
                  };
                  if (days != null && days > 0) {
                        const dateTo = new Date();
                        const dateFrom = new Date();
                        dateFrom.setDate(dateFrom.getDate() - days);
                        filters.dateFrom = dateFrom.toISOString().split("T")[0];
                        filters.dateTo = dateTo.toISOString().split("T")[0];
                  }

                  const response = await BetHistoryService.getUserBets(filters);

                  if (response.success && response.data) {
                        const allBets = [
                              ...(response.data.singleBets || []),
                              ...(response.data.multibets || []),
                        ];
                        // Sort by creation date (most recent first)
                        const sortedBets = allBets.sort((a, b) => {
                              const dateA = new Date(
                                    a.timestamp || (a as any).createdAt || ""
                              ).getTime();
                              const dateB = new Date(
                                    b.timestamp || (b as any).createdAt || ""
                              ).getTime();
                              return dateB - dateA;
                        });
                        setRecentBets(sortedBets);
                        console.log("✅ Recent bets loaded:", sortedBets.length);
                  } else {
                        setRecentBets([]);
                  }
            } catch (error: any) {
                  console.error("❌ Error loading recent bets:", error);
                  setBetsError(error.message || "Failed to load recent bets");
                  setRecentBets([]);
            } finally {
                  setIsLoadingBets(false);
            }
      }, [user?.id]);

      return {
            recentBets,
            isLoadingBets,
            betsError,
            loadRecentBets,
      };
};
