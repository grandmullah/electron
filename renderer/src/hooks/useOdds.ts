import useSWR from 'swr';
import { Game } from '../services/gamesService';
import GamesService from '../services/gamesService';
import { API_BASE_URL } from '../services/apiConfig';

// Fetcher function for SWR
const oddsFetcher = async (url: string): Promise<Game[]> => {
      // Extract league key from URL - the URL format is /api/leagues/{leagueKey}/odds
      const urlParts = url.split('/');
      const leagueKey = urlParts[urlParts.length - 2]; // Get the league key from the URL

      // Use the existing GamesService to get properly processed data
      if (!leagueKey) {
            throw new Error('Invalid league key extracted from URL');
      }
      return await GamesService.fetchOdds(leagueKey);
};

// Custom hook for fetching odds with SWR
export const useOdds = (leagueKey: string) => {
      // Use the correct API endpoint format: /api/leagues/{league_key}/odds
      // Don't fetch if leagueKey is empty
      const endpoint = leagueKey ? `${API_BASE_URL}/leagues/${leagueKey}/odds` : null;

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
