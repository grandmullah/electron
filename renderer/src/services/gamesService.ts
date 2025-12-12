import axios from 'axios';
import { API_BASE_URL, API_KEY } from './apiConfig';
import {
      Game,
      GameDetails,
      GameDetailsResponse,
      GameSearchFilters,
      GameSearchResult,
      SearchResponse,
      AutocompleteResponse,
      GameSuggestion
} from '../types/games';
import {
      parseOddsFromGameOddsArray,
      parseOddsFromBookmakersArray
} from '../utils/oddsParser';

class GamesService {
      /**
       * Get headers with API key for all requests
       */
      private static getHeaders(): Record<string, string> {
            return {
                  'Content-Type': 'application/json',
                  'X-API-Key': API_KEY,
            };
      }
      /**
       * Fetch odds for a specific league
       * @param leagueKey - The league identifier (e.g., 'soccer_epl')
       * @returns Promise<Game[]> - Array of games with odds
       */
      static async fetchOdds(leagueKey: string): Promise<Game[]> {
            try {
                  // Use the correct API endpoint format: /api/leagues/{league_key}/odds
                  const path = `/leagues/${leagueKey}/odds`;

                  // Make the API call with API key header
                  const response = await axios.get(`${API_BASE_URL}${path}`, {
                        headers: this.getHeaders(),
                  });

                  const games: Game[] = (response.data?.data || [])
                        .map((game: any) => {
                              return this.transformLegacyGameData(game);
                        })
                        .filter((game: Game | null) => game !== null && game !== undefined);

                  return games;
            } catch (error: any) {
                  // Basic error normalization
                  const message = error?.response?.data?.message || error.message || 'Failed to load games';
                  throw new Error(message);
            }
      }

      /**
       * Fetch a specific game by ID (supports both UUID and external_id)
       * Endpoint: GET /api/games/:gameId
       * @param gameId - The unique identifier (UUID or external_id)
       * @returns Promise<Game> - The game details with odds
       */
      static async fetchGameById(gameId: string): Promise<Game> {
            try {
                  const response = await axios.get<GameDetailsResponse>(`${API_BASE_URL}/games/${gameId}`, {
                        headers: this.getHeaders(),
                  });

                  if (response.data?.success && response.data?.data) {
                        const gameDetails = response.data.data;
                        return this.transformGameDetails(gameDetails);
                  } else {
                        throw new Error('Game not found');
                  }
            } catch (error: any) {
                  const message = error?.response?.data?.error || error.message || 'Failed to fetch game';
                  throw new Error(message);
            }
      }

      /**
       * Search games with filters
       * Endpoint: GET /api/games/search
       * Supports partial matching for external_id (last 4 chars work!)
       * @param filters - Search filters
       * @returns Promise<Game[]> - Array of matching games
       */
      static async searchGames(filters: GameSearchFilters): Promise<Game[]> {
            try {
                  // Build query string from filters
                  const queryParams = new URLSearchParams();

                  if (filters.externalId) queryParams.append('externalId', filters.externalId);
                  if (filters.status) queryParams.append('status', filters.status);
                  if (filters.sportKey) queryParams.append('sportKey', filters.sportKey);
                  if (filters.startDate) queryParams.append('startDate', filters.startDate);
                  if (filters.endDate) queryParams.append('endDate', filters.endDate);
                  if (filters.search) queryParams.append('search', filters.search);
                  if (filters.limit) queryParams.append('limit', filters.limit.toString());
                  if (filters.offset) queryParams.append('offset', filters.offset.toString());

                  const queryString = queryParams.toString();
                  const url = `${API_BASE_URL}/games/search${queryString ? `?${queryString}` : ''}`;

                  const response = await axios.get<SearchResponse>(url, {
                        headers: this.getHeaders(),
                  });

                  if (response.data?.success && response.data?.data) {
                        const games = Array.isArray(response.data.data) ? response.data.data : [];
                        return games.map((game: GameSearchResult) => this.transformSearchResult(game));
                  } else {
                        return [];
                  }
            } catch (error: any) {
                  const message = error?.response?.data?.error || error.message || 'Failed to search games';
                  console.error('Search games error:', message);
                  throw new Error(message);
            }
      }

      /**
       * Autocomplete search for type-ahead functionality
       * Endpoint: GET /api/games/autocomplete
       * @param query - Search query (minimum 2 characters)
       * @param limit - Maximum number of results (default 10)
       * @returns Promise<GameSuggestion[]> - Array of game suggestions
       */
      static async autocompleteGames(query: string, limit: number = 10): Promise<GameSuggestion[]> {
            try {
                  if (query.length < 2) {
                        return [];
                  }

                  const response = await axios.get<AutocompleteResponse>(`${API_BASE_URL}/games/autocomplete`, {
                        params: { q: query, limit },
                        headers: this.getHeaders(),
                  });

                  if (response.data?.success && response.data?.data) {
                        return response.data.data;
                  } else {
                        return [];
                  }
            } catch (error: any) {
                  console.error('Autocomplete error:', error);
                  return [];
            }
      }

      /**
       * Transform GameSuggestion (from autocomplete) to frontend Game format
       * Handles all possible fields that autocomplete can return
       * @param suggestion - Game suggestion from autocomplete
       * @returns Game - Transformed game object
       */
      static transformAutocompleteToGame(suggestion: GameSuggestion): Game {
            const homeTeam = suggestion.homeTeam;
            const awayTeam = suggestion.awayTeam;

            // Parse odds if available
            let parsedOdds;
            if (suggestion.odds && suggestion.odds.length > 0) {
                  parsedOdds = parseOddsFromGameOddsArray(suggestion.odds, homeTeam, awayTeam);
            } else {
                  // No odds available
                  parsedOdds = {
                        homeOdds: null,
                        drawOdds: null,
                        awayOdds: null,
                        doubleChance: {
                              homeOrDraw: null,
                              homeOrAway: null,
                              drawOrAway: null,
                        },
                        overUnder: {
                              over25: null,
                              under25: null,
                        },
                        totals: [],
                        bothTeamsToScore: {
                              yes: null,
                              no: null,
                        },
                        spreads: {
                              homeSpread: null,
                              awaySpread: null,
                              homeSpreadOdds: null,
                              awaySpreadOdds: null,
                              spreadLine: null,
                        },
                        hasValidOdds: suggestion.hasOdds || false,
                  };
            }

            // Extract externalId: prioritize team_index.externalId, then top-level external_id, finally fall back to id
            const externalId = (suggestion as any).team_index?.externalId || suggestion.external_id || suggestion.id;

            return {
                  id: suggestion.id,
                  externalId: externalId,
                  homeTeam: homeTeam,
                  awayTeam: awayTeam,
                  ...parsedOdds,
                  matchTime: suggestion.commenceTime,
                  league: suggestion.league,
                  sportKey: suggestion.sportKey || suggestion.leagueKey || 'soccer',
                  status: suggestion.status,
                  currentScore: {
                        home: suggestion.homeScore || 0,
                        away: suggestion.awayScore || 0,
                  },
                  currentPeriod: suggestion.currentPeriod || 0,
                  currentTime: suggestion.currentTime || null,
                  // Preserve team_index from API (if available)
                  team_index: (suggestion as any).team_index,
            };
      }

      /**
       * Transform GameDetails (from /:id endpoint) to frontend Game format
       * @param gameDetails - Raw game details from backend
       * @returns Game - Transformed game object
       */
      private static transformGameDetails(gameDetails: GameDetails): Game {
            const odds = gameDetails.odds || [];
            const homeTeamName = gameDetails.home_team_name;
            const awayTeamName = gameDetails.away_team_name;

            // Use the modular odds parser
            const parsedOdds = parseOddsFromGameOddsArray(odds, homeTeamName, awayTeamName);

            // Extract externalId: prioritize team_index.externalId, then top-level external_id, finally fall back to id
            const externalId = (gameDetails as any).team_index?.externalId || gameDetails.external_id || gameDetails.id;

            return {
                  id: gameDetails.id,
                  externalId: externalId,
                  homeTeam: homeTeamName,
                  awayTeam: awayTeamName,
                  ...parsedOdds,
                  matchTime: gameDetails.commence_time,
                  league: gameDetails.league_title,
                  sportKey: gameDetails.league_id,
                  status: gameDetails.status,
                  currentScore: {
                        home: gameDetails.home_score,
                        away: gameDetails.away_score,
                  },
                  currentPeriod: gameDetails.current_period,
                  currentTime: gameDetails.current_time,
                  // Preserve team_index from API (if available)
                  team_index: (gameDetails as any).team_index,
            };
      }

      /**
       * Transform search result to frontend Game format (without odds)
       * @param searchResult - Search result from backend
       * @returns Game - Transformed game object
       */
      private static transformSearchResult(searchResult: GameSearchResult): Game {
            // Extract externalId: prioritize team_index.externalId, then fall back to id
            const externalId = (searchResult as any).team_index?.externalId || searchResult.id;

            return {
                  id: searchResult.id,
                  externalId: externalId,
                  homeTeam: searchResult.homeTeam,
                  awayTeam: searchResult.awayTeam,
                  homeOdds: null,
                  drawOdds: null,
                  awayOdds: null,
                  matchTime: typeof searchResult.commenceTime === 'string'
                        ? searchResult.commenceTime
                        : searchResult.commenceTime.toISOString(),
                  league: searchResult.leagueTitle,
                  sportKey: searchResult.sportKey,
                  status: searchResult.status,
                  doubleChance: {
                        homeOrDraw: null,
                        homeOrAway: null,
                        drawOrAway: null,
                  },
                  overUnder: {
                        over25: null,
                        under25: null,
                  },
                  totals: [],
                  bothTeamsToScore: {
                        yes: null,
                        no: null,
                  },
                  spreads: {
                        homeSpread: null,
                        awaySpread: null,
                        homeSpreadOdds: null,
                        awaySpreadOdds: null,
                        spreadLine: null,
                  },
                  hasValidOdds: false,
                  currentScore: {
                        home: searchResult.homeScore || 0,
                        away: searchResult.awayScore || 0,
                  },
                  currentPeriod: searchResult.currentPeriod || 0,
                  currentTime: searchResult.currentTime || null,
                  // Preserve team_index from API (if available)
                  team_index: (searchResult as any).team_index,
            };
      }

      /**
       * Transform legacy game data (for backward compatibility with /leagues endpoint)
       * @param game - Raw game data from legacy endpoint
       * @returns Game - Transformed game object
       */
      private static transformLegacyGameData(game: any): Game {
            const bookmakers = Array.isArray(game.bookmakers) ? game.bookmakers : [];
            const homeTeamName = game.home_team || game.homeTeam;
            const awayTeamName = game.away_team || game.awayTeam;

            // Use the modular odds parser
            const parsedOdds = parseOddsFromBookmakersArray(bookmakers, homeTeamName, awayTeamName);

            // Extract externalId: prioritize team_index.externalId, then top-level external_id, finally fall back to id
            const externalId = game.team_index?.externalId || game.external_id || game.id;

            return {
                  id: game.id,
                  externalId: externalId,
                  homeTeam: homeTeamName,
                  awayTeam: awayTeamName,
                  ...parsedOdds,
                  matchTime: game.commence_time || game.matchTime,
                  league: game.sport_title || game.league,
                  sportKey: game.sport_key || game.sportKey || 'soccer_epl',
                  status: (game.status === 'scheduled' ? 'upcoming' : game.status) || 'upcoming',
                  currentPeriod: 0,
                  currentTime: null,
                  // Preserve team_index from API
                  team_index: game.team_index,
            };
      }

      // Legacy methods for backward compatibility
      static async fetchEplOdds(): Promise<Game[]> {
            return this.fetchOdds('soccer_epl');
      }

      static async fetchUefaWorldCupQualifiersOdds(): Promise<Game[]> {
            return this.fetchOdds('soccer_uefa_world_cup_qualifiers');
      }

      static async fetchBundesligaOdds(): Promise<Game[]> {
            return this.fetchOdds('soccer_bundesliga');
      }

      static async fetchLaligaOdds(): Promise<Game[]> {
            return this.fetchOdds('soccer_laliga');
      }
}

export default GamesService;

// Re-export the Game interface for convenience
export type { Game } from '../types/games';
