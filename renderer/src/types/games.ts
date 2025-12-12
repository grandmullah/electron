/**
 * Game-related TypeScript interfaces matching backend API responses
 * Based on: /Users/Biegon/Desktop/betzone/betzoneApp/betzone-sports
 */

// ===================================
// AUTOCOMPLETE TYPES
// ===================================

export interface AutocompleteResponse {
      success: boolean;
      data: GameSuggestion[];
      count: number;
      query: string;
      message?: string;
}

export interface GameSuggestion {
      // ============= BASIC INFO =============
      id: string;
      external_id: string;
      label: string;

      // ============= TEAMS =============
      homeTeam: string;
      awayTeam: string;

      // ============= LEAGUE & SPORT =============
      league: string;
      leagueKey?: string;
      leagueId?: string;
      sport: string;
      sportKey?: string;
      sportId?: string;

      // ============= STATUS & TIME =============
      status: GameStatus;
      commenceTime: string;
      currentPeriod?: number;
      currentTime?: string | null;

      // ============= SCORES =============
      homeScore?: number;
      awayScore?: number;
      homeHalftimeScore?: number | null;
      awayHalftimeScore?: number | null;
      homeFulltimeScore?: number | null;
      awayFulltimeScore?: number | null;
      finalScore?: string | null;

      // ============= TIMESTAMPS =============
      lastUpdated?: string;
      resultUpdatedAt?: string | null;
      createdAt?: string;
      updatedAt?: string;

      // ============= SETTLEMENT =============
      settlementStatus?: 'pending' | 'settled';
      settledAt?: string | null;
      isActive?: boolean;

      // ============= ODDS (if available) =============
      odds?: GameOdds[];
      hasOdds?: boolean;
}

// ===================================
// SEARCH TYPES
// ===================================

export interface SearchResponse {
      success: boolean;
      data: GameSearchResult[];
      count: number;
}

export interface GameSearchResult {
      id: string;
      sportKey: string;
      sportTitle: string;
      leagueKey: string;
      leagueTitle: string;
      homeTeam: string;
      awayTeam: string;
      commenceTime: string | Date;
      status: GameStatus;
      homeScore?: number;
      awayScore?: number;
      currentPeriod?: number;
      currentTime?: string;
      lastUpdated?: string | Date;
      created_at: string | Date;
      updated_at: string | Date;
}

// ===================================
// GAME DETAILS TYPES (/:id endpoint)
// ===================================

export interface GameDetailsResponse {
      success: boolean;
      data: GameDetails;
}

export interface GameDetails {
      id: string;
      external_id: string;
      sport_id: string;
      league_id: string;
      home_team_name: string;
      away_team_name: string;
      commence_time: string;
      status: GameStatus;
      current_period: number;
      current_time: string | null;
      home_score: number;
      away_score: number;
      home_halftime_score: number | null;
      away_halftime_score: number | null;
      home_fulltime_score: number | null;
      away_fulltime_score: number | null;
      final_score: string | null;
      last_updated: string;
      result_updated_at: string | null;
      settlement_status: 'pending' | 'settled';
      settled_at: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      league_title: string;
      sport_title: string;
      odds: GameOdds[];
}

export interface GameOdds {
      bookmaker_key: string;
      bookmaker_title: string;
      market_key: string;
      market_title: string;
      outcome_name: string;
      outcome_price: number;
      outcome_point: number | null;
      last_update: string;
}

// ===================================
// COMMON TYPES
// ===================================

export type GameStatus =
      | 'scheduled'   // Game hasn't started yet
      | 'live'        // Game in progress
      | 'finished'    // Game completed
      | 'cancelled'   // Game cancelled
      | 'postponed';  // Game postponed

// ===================================
// FRONTEND DISPLAY TYPES
// (Normalized for easier frontend use)
// ===================================

export interface Game {
      id: string;
      externalId: string;
      homeTeam: string;
      awayTeam: string;
      homeOdds: number | string | null;
      drawOdds: number | string | null;
      awayOdds: number | string | null;
      matchTime: string;
      league: string;
      sportKey: string;
      status: GameStatus;
      doubleChance: {
            homeOrDraw: number | string | null;
            homeOrAway: number | string | null;
            drawOrAway: number | string | null;
      };
      overUnder: {
            over25: number | string | null;
            under25: number | string | null;
      };
      totals: Array<{
            point: number;
            over: number | string | null;
            under: number | string | null;
      }>;
      bothTeamsToScore: {
            yes: number | string | null;
            no: number | string | null;
      };
      spreads: {
            homeSpread: number | string | null;
            awaySpread: number | string | null;
            homeSpreadOdds: number | string | null;
            awaySpreadOdds: number | string | null;
            spreadLine: number | string | null;
      };
      // Half-time markets
      h2h_h1?: {
            home: number | string | null;
            draw: number | string | null;
            away: number | string | null;
      };
      h2h_h2?: {
            home: number | string | null;
            draw: number | string | null;
            away: number | string | null;
      };
      totals_h1?: Array<{
            point: number;
            over: number | string | null;
            under: number | string | null;
      }>;
      totals_h2?: Array<{
            point: number;
            over: number | string | null;
            under: number | string | null;
      }>;
      // Team totals (full-time)
      teamTotals?: Array<{
            team: string; // "home" or "away"
            point: number;
            over: number | string | null;
            under: number | string | null;
      }>;
      // Team totals (half-time)
      team_totals_h1?: Array<{
            team: string; // "home" or "away"
            point: number;
            over: number | string | null;
            under: number | string | null;
      }>;
      team_totals_h2?: Array<{
            team: string; // "home" or "away"
            point: number;
            over: number | string | null;
            under: number | string | null;
      }>;
      hasValidOdds: boolean;
      currentScore?: {
            home: number;
            away: number;
      };
      currentPeriod: number;
      currentTime: string | null;
      // Team index from API - contains league, game, and full index info
      team_index?: {
            leagueIndex: number;
            gameIndex: number;
            fullIndex: number;
            homeTeam: string;
            awayTeam: string;
            gameId: string;
            externalId: string;
            createdAt: string;
            expiresAt: string;
      };
}

// ===================================
// SEARCH FILTERS
// ===================================

export interface GameSearchFilters {
      externalId?: string;      // External game ID (supports partial matching!)
      status?: GameStatus;       // Game status
      sportKey?: string;         // Sport identifier
      startDate?: string;        // ISO date string
      endDate?: string;          // ISO date string
      search?: string;           // General search term
      limit?: number;            // Max results (default 50)
      offset?: number;           // Pagination offset
}

// ===================================
// ERROR RESPONSE
// ===================================

export interface ErrorResponse {
      success: false;
      error: string;
}

