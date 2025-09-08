import useSWR from 'swr';
import { Game } from '../services/gamesService';
import GamesService from '../services/gamesService';

// Fetcher function for SWR
const oddsFetcher = async (url: string): Promise<Game[]> => {
      // Extract league key from URL to use with GamesService
      const leagueKey = url.includes('/uefa-world-cup-qualifiers/')
            ? 'soccer_uefa_world_cup_qualifiers'
            : 'soccer_epl';

      // Use the existing GamesService to get properly processed data
      return await GamesService.fetchOdds(leagueKey);
};

// Custom hook for fetching odds with SWR
export const useOdds = (leagueKey: string) => {
      // Map league keys to API endpoints
      const getEndpoint = (key: string): string | null => {
            const leaguePathMap: Record<string, string> = {
                  soccer_epl: '/epl/odds',
                  soccer_uefa_world_cup_qualifiers: '/uefa-world-cup-qualifiers/odds',
            };

            const path = leaguePathMap[key];
            return path ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}${path}` : null;
      };

      const endpoint = getEndpoint(leagueKey);

      const { data, error, isLoading, mutate } = useSWR<Game[]>(
            endpoint,
            oddsFetcher,
            {
                  // Revalidate every 30 seconds for live odds
                  refreshInterval: 30000,
                  // Revalidate when window regains focus
                  revalidateOnFocus: true,
                  // Revalidate when network reconnects
                  revalidateOnReconnect: true,
                  // Don't retry on 404 errors (endpoint not implemented)
                  shouldRetryOnError: (error) => {
                        return error?.status !== 404;
                  },
                  // Retry configuration
                  errorRetryCount: 3,
                  errorRetryInterval: 5000,
                  // Keep previous data while revalidating
                  keepPreviousData: true,
                  // Dedupe requests within 2 seconds
                  dedupingInterval: 2000,
            }
      );

      return {
            games: data || [],
            isLoading,
            error,
            mutate, // Function to manually trigger revalidation
            isError: !!error,
            isEmpty: !isLoading && (!data || data.length === 0),
      };
};

// Hook for manual refresh
export const useRefreshOdds = () => {
      const refresh = () => {
            // Trigger revalidation for all SWR keys
            if (typeof window !== 'undefined' && (window as any).swrCache) {
                  (window as any).swrCache.clear();
            }
      };

      return { refresh };
};
