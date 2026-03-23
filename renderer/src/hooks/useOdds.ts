import useSWR from 'swr';
import { Game } from '../services/gamesService';
import GamesService from '../services/gamesService';
import { API_BASE_URL } from '../services/apiConfig';

type PaginationInfo = {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
};

type UpcomingResult = { games: Game[]; pagination: PaginationInfo };

const oddsFetcher = async (url: string): Promise<Game[]> => {
      const urlParts = url.split('/');
      const leagueKey = urlParts[urlParts.length - 2];
      if (!leagueKey) throw new Error('Invalid league key');
      return await GamesService.fetchOdds(leagueKey);
};

const upcomingFetcher = async (url: string): Promise<UpcomingResult> => {
      const parsed = new URL(url, 'http://localhost');
      const page = Number(parsed.searchParams.get('page') || '1');
      const limit = Number(parsed.searchParams.get('limit') || '50');
      return await GamesService.fetchUpcomingGames({ page, limit });
};

export const useOdds = (leagueKey: string, page: number = 1, limit: number = 50) => {
      const hasLeague = !!leagueKey?.trim();

      const leagueEndpoint = hasLeague ? `${API_BASE_URL}/leagues/${leagueKey}/odds` : null;
      const upcomingEndpoint = !hasLeague ? `${API_BASE_URL}/games/upcoming?page=${page}&limit=${limit}` : null;

      const leagueSwr = useSWR<Game[]>(
            leagueEndpoint,
            oddsFetcher,
            {
                  refreshInterval: 30000,
                  revalidateOnFocus: false,
                  revalidateOnReconnect: true,
                  shouldRetryOnError: (err) => err?.status !== 404,
                  errorRetryCount: 3,
                  errorRetryInterval: 5000,
                  keepPreviousData: true,
                  dedupingInterval: 10000,
                  focusThrottleInterval: 15000,
            }
      );

      const upcomingSwr = useSWR<UpcomingResult>(
            upcomingEndpoint,
            upcomingFetcher,
            {
                  refreshInterval: 30000,
                  revalidateOnFocus: false,
                  revalidateOnReconnect: true,
                  shouldRetryOnError: (err) => err?.status !== 404,
                  errorRetryCount: 3,
                  errorRetryInterval: 5000,
                  keepPreviousData: true,
                  dedupingInterval: 10000,
                  focusThrottleInterval: 15000,
            }
      );

      if (hasLeague) {
            return {
                  games: leagueSwr.data || [],
                  isLoading: leagueSwr.isLoading,
                  error: leagueSwr.error,
                  mutate: leagueSwr.mutate as any,
                  isError: !!leagueSwr.error,
                  isEmpty: !leagueSwr.isLoading && (!leagueSwr.data || leagueSwr.data.length === 0),
                  pagination: null as PaginationInfo | null,
            };
      }

      const result = upcomingSwr.data;
      return {
            games: result?.games || [],
            isLoading: upcomingSwr.isLoading,
            error: upcomingSwr.error,
            mutate: upcomingSwr.mutate as any,
            isError: !!upcomingSwr.error,
            isEmpty: !upcomingSwr.isLoading && (!result?.games || result.games.length === 0),
            pagination: result?.pagination || null as PaginationInfo | null,
      };
};

