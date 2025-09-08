import { useState, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { BetHistoryService } from '../services/betHistoryService';

export const useBetsData = () => {
      const { user } = useAppSelector((state) => state.auth);

      const [recentBets, setRecentBets] = useState<any[]>([]);
      const [isLoadingBets, setIsLoadingBets] = useState(false);
      const [betsError, setBetsError] = useState<string | null>(null);

      const loadRecentBets = useCallback(async () => {
            if (!user?.id) return;

            setIsLoadingBets(true);
            setBetsError(null);

            try {
                  console.log("🔄 Loading recent bets...");

                  const filters = {
                        includeShopBets: true,
                  };

                  const response = await BetHistoryService.getUserBets(filters);

                  if (response.success && response.data) {
                        const allBets = [
                              ...(response.data.singleBets || []),
                              ...(response.data.multibets || []),
                        ];
                        // Sort by creation date and take the most recent 10
                        const sortedBets = allBets
                              .sort((a, b) => {
                                    const dateA = new Date(
                                          a.timestamp || (a as any).createdAt || ""
                                    ).getTime();
                                    const dateB = new Date(
                                          b.timestamp || (b as any).createdAt || ""
                                    ).getTime();
                                    return dateB - dateA;
                              })
                              .slice(0, 10);
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
