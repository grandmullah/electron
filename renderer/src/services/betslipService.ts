import axios from 'axios';
import { BetSlipItem } from '../store/betslipSlice';
import { BetSlip, BetSlipResponse } from '../types/bets';
import { API_BASE_URL } from './apiConfig';
import { toApiMarketKey } from '../utils/oddsParser';

// Backend-supported internal market types (must stay in sync with backend contract)
const ALLOWED_INTERNAL_MARKET_TYPES: Set<string> = new Set([
      // H2H (1X2 / match winner, including time-based)
      'h2h',
      'h2h_h1',
      'h2h_h2',
      'h2h_10_minutes',
      'h2h_15_minutes',
      'h2h_30_minutes',
      'h2h_60_minutes',
      'h2h_75_minutes',
      'h2h_first_team_to_score_h1',
      // Totals – goals (and result+totals, time bands)
      'totals',
      'totals_h1',
      'totals_h2',
      'result_totals',
      'totals_1_15_minutes',
      'totals_16_30_minutes',
      'totals_31_45_minutes',
      'totals_46_60_minutes',
      'totals_61_75_minutes',
      'totals_76_90_minutes',
      'totals_15_30_minutes',
      'totals_30_45_minutes',
      // Totals – corners
      'totals_corners',
      'totals_corners_h1',
      'totals_corners_h2',
      'totals_corners_home',
      'totals_corners_away',
      // Totals – cards
      'totals_cards',
      'totals_cards_0_10_m',
      'totals_cards_10_25_m',
      'totals_cards_25_40_m',
      'totals_cards_40_55_m',
      'totals_cards_55_70_m',
      'totals_cards_70_90_m',
      'totals_yellow_cards',
      'totals_yellow_cards_h1',
      'totals_yellow_cards_h2',
      // Totals – fouls / shots / offsides / tackles
      'totals_fouls',
      'totals_fouls_home',
      'totals_fouls_away',
      'totals_tackles',
      'totals_shots',
      'totals_shotongoal',
      'totals_offsides',
      'totals_offsides_home',
      'totals_offsides_away',
      // Spreads / handicaps
      'spreads',
      // Both teams to score / double chance
      'btts',
      'double_chance',
      // Team totals (goals)
      'team_totals',
      'team_totals_h1',
      'team_totals_h2',
      // Correct score
      'correct_score',
      'correct_score_h1',
      'correct_score_h2',
      // Legacy (kept for backward compat in backend; not actively used here)
      'first_scorer',
]);

const ensureAllowedMarketType = (internalKey: string, betType: string): string => {
      if (!ALLOWED_INTERNAL_MARKET_TYPES.has(internalKey)) {
            throw new Error(`Unsupported market type "${internalKey}" derived from bet type "${betType}". Please refresh odds or contact support.`);
      }
      return internalKey;
};

// API base URL is centralized in apiConfig.ts

// Types for API requests and responses
export interface SingleBetRequest {
      bets: Array<{
            gameId: string;
            homeTeam: string;
            awayTeam: string;
            betType: string;
            selection: string;
            odds: number;
            stake: number;
            timestamp?: string;
      }>;
      totalStake: number;
      timestamp?: string;
}

export interface MultibetRequest {
      bets: Array<{
            gameId: string;
            homeTeam: string;
            awayTeam: string;
            betType: string;
            selection: string;
            odds: number;
            stake: number;
            timestamp?: string;
      }>;
      totalStake: number;
      combinedOdds?: number;
      potentialWinnings?: number;
      timestamp?: string;
}

export interface BetResponse {
      success: boolean;
      betId: string;
      message: string;
      status: 'pending' | 'accepted' | 'rejected';
      timestamp: string;
}

export interface BetError {
      success: false;
      error: string;
      code: string;
      message?: string;
      details?: any;
}

// Service class for betslip operations
export class BetSlipService {
      private static generateBetId(): string {
            return `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      private static getUserId(): string {
            const user = localStorage.getItem('betzone_user');
            if (user) {
                  try {
                        const userData = JSON.parse(user);
                        if (userData.id) return userData.id;
                  } catch {
                        // ignore
                  }
            }
            const authUser = localStorage.getItem('authUser');
            if (authUser) {
                  try {
                        const userData = JSON.parse(authUser);
                        if (userData.id) return userData.id;
                  } catch {
                        // ignore
                  }
            }
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                  throw new Error('User not authenticated - no auth token found');
            }
            try {
                  const tokenParts = authToken.split('.');
                  if (tokenParts.length === 3) {
                        const payload = JSON.parse(atob(tokenParts[1] || ''));
                        const userId = payload.userId || payload.user_id || payload.sub || payload.id;
                        if (userId) return userId;
                  }
            } catch {
                  // ignore
            }
            throw new Error('User ID not found. Please try logging in again or refresh the page.');
      }

      public static deriveMarketTypeFromBetType(betType: string): string {
            const key = (betType || '').toLowerCase();
            const normalized = key.replace(/\s+/g, ' ').trim();

            const isFirstHalf =
                  normalized.includes('1st half') ||
                  normalized.includes('first half') ||
                  normalized.includes('1h ');
            const isSecondHalf =
                  normalized.includes('2nd half') ||
                  normalized.includes('second half') ||
                  normalized.includes('2h ');

            const base = normalized
                  .replace(/1st half/g, '')
                  .replace(/first half/g, '')
                  .replace(/2nd half/g, '')
                  .replace(/second half/g, '')
                  .trim();

            const containsResultTotals =
                  base.includes('result + total') ||
                  base.includes('result & total') ||
                  base.includes('result and total');

            const containsTotals =
                  base.includes('over/under') ||
                  base.includes('o/u') ||
                  base.includes('total goals') ||
                  base.startsWith('totals') ||
                  base.includes(' totals');

            const containsTeamTotals =
                  base.includes('team total') ||
                  base.includes('team totals');

            const containsDoubleChance =
                  base.includes('double chance') ||
                  base === 'double chance' ||
                  base === 'dc';

            const containsBTTS =
                  base.includes('both teams to score') ||
                  base.includes('btts');

            const containsH2H =
                  base.includes('3 way') ||
                  base.includes('3-way') ||
                  base.includes('1x2') ||
                  base.includes('match') ||
                  base.includes('h2h') ||
                  base === '3 way';

            const containsSpread =
                  base.includes('spread') ||
                  base.includes('handicap');

            const containsCorners = base.includes('corner');
            const containsCards = base.includes('card');
            const containsFouls = base.includes('foul');
            const containsShots = base.includes('shot');
            const containsOffsides = base.includes('offside');
            const containsTackles = base.includes('tackle');

            // Half-time specific markets
            if (isFirstHalf) {
                  if (containsResultTotals) return 'result_totals';
                  if (containsCorners) return 'totals_corners_h1';
                  if (containsCards) return 'totals_yellow_cards_h1';
                  if (containsFouls) return 'totals_fouls';
                  if (containsShots) return 'totals_shots';
                  if (containsOffsides) return 'totals_offsides';
                  if (containsTackles) return 'totals_tackles';
                  if (containsTeamTotals) return 'team_totals_h1';
                  if (containsTotals) return 'totals_h1';
                  if (containsDoubleChance) return 'double_chance_h1';
                  if (containsBTTS) return 'btts_h1';
                  if (containsH2H || containsSpread) return 'h2h_h1';
            }

            if (isSecondHalf) {
                  if (containsResultTotals) return 'result_totals';
                  if (containsCorners) return 'totals_corners_h2';
                  if (containsCards) return 'totals_yellow_cards_h2';
                  if (containsFouls) return 'totals_fouls';
                  if (containsShots) return 'totals_shots';
                  if (containsOffsides) return 'totals_offsides';
                  if (containsTackles) return 'totals_tackles';
                  if (containsTeamTotals) return 'team_totals_h2';
                  if (containsTotals) return 'totals_h2';
                  if (containsDoubleChance) return 'double_chance_h2';
                  if (containsBTTS) return 'btts_h2';
                  if (containsH2H || containsSpread) return 'h2h_h2';
            }

            // Full Match / generic markets (no explicit half)
            if (containsResultTotals) return 'result_totals';
            if (containsCorners) return 'totals_corners';
            if (containsCards) return 'totals_cards';
            if (containsFouls) return 'totals_fouls';
            if (containsShots) return 'totals_shots';
            if (containsOffsides) return 'totals_offsides';
            if (containsTackles) return 'totals_tackles';
            if (containsTeamTotals) return 'team_totals';
            if (containsTotals) return 'totals';
            if (containsDoubleChance) return 'double_chance';
            if (containsBTTS) return 'btts';
            if (containsSpread) return 'spreads';
            if (containsH2H) return 'h2h';

            // Fallback: derive from common English labels used in UI
            if (normalized === 'over/under' || normalized.startsWith('over/under ')) return 'totals';
            if (normalized === '3 way') return 'h2h';

            // Default to H2H for any unrecognized bet types
            return 'h2h';
      }

      /** Internal market key → API market key for bet placement (e.g. h2h → match_winner). Handles team_totals → total_home/total_away from selection. */
      // public static getApiMarketKeyForBet(bet: BetSlipItem): string {
      //       const marketType = this.deriveMarketTypeFromBetType(bet.betType);
      //       let apiKey = toApiMarketKey(marketType);
      //       if (marketType === 'team_totals') {
      //             const sel = (bet.selection || '').toLowerCase();
      //             const home = (bet.homeTeam || '').toLowerCase();
      //             apiKey = home && sel.includes(home) ? 'total_home' : 'total_away';
      //       }
      //       return apiKey;
      // }

      public static deriveOutcomeForMarket(bet: BetSlipItem, marketType: string): string {
            const selection = (bet.selection || '').toLowerCase();

            switch (marketType) {
                  case 'h2h':
                  case 'h2h_h1':  // First half H2H
                  case 'h2h_h2':  // Second half H2H
                        // Handle H2H selections (Home, Draw, Away)
                        if (selection === 'home') return bet.homeTeam;
                        if (selection === 'away') return bet.awayTeam;
                        if (selection === 'draw') return 'Draw';

                        // Handle Spread selections
                        if (selection === 'home') return bet.homeTeam;
                        if (selection === 'away') return bet.awayTeam;

                        return bet.selection || '';

                  case 'double_chance':
                  case 'double_chance_h1':  // First half double chance
                  case 'double_chance_h2':  // Second half double chance
                        // Map to the exact team names the backend expects (from API response)
                        if (selection === '1 or x' || selection === '1x' || selection.includes('home') && selection.includes('draw')) {
                              return `${bet.homeTeam} or Draw`;
                        }
                        if (selection === 'x or 2' || selection === 'x2' || selection.includes('draw') && selection.includes('away')) {
                              return `Draw or ${bet.awayTeam}`;
                        }
                        if (selection === '1 or 2' || selection === '12' || (selection.includes('home') && selection.includes('away'))) {
                              return `${bet.homeTeam} or ${bet.awayTeam}`;
                        }
                        return bet.selection || '';

                  case 'totals':
                  case 'totals_h1':  // First half totals
                  case 'totals_h2':  // Second half totals
                  case 'team_totals_h1':  // First half team totals
                  case 'team_totals_h2':  // Second half team totals
                        // Handle Over/Under selections - preserve point value
                        // Selection format: "Over 2.5", "Under 3", etc.
                        const selectionStr = bet.selection || '';
                        const pointMatch = selectionStr.match(/(-?\d+(?:\.\d+)?)/);
                        const pointValue = pointMatch ? pointMatch[1] : undefined;

                        if (selection.includes('over')) {
                              return pointValue ? `Over ${pointValue}` : 'Over';
                        }
                        if (selection.includes('under')) {
                              return pointValue ? `Under ${pointValue}` : 'Under';
                        }
                        return selectionStr;

                  case 'btts':
                  case 'btts_h1':  // First half BTTS
                  case 'btts_h2':  // Second half BTTS
                        // Handle Both Teams To Score selections
                        if (selection === 'yes' || selection === 'no') {
                              return bet.selection.charAt(0).toUpperCase() + bet.selection.slice(1).toLowerCase();
                        }
                        return bet.selection;

                  default:
                        return bet.selection;
            }
      }

      // Convert betslip items to API format (deprecated - keeping for compatibility)
      private static convertToSingleBetRequest(
            bet: BetSlipItem,
            userId: string
      ): SingleBetRequest {
            return {
                  bets: [{
                        gameId: bet.gameId,
                        homeTeam: bet.homeTeam,
                        awayTeam: bet.awayTeam,
                        betType: bet.betType,
                        selection: bet.selection,
                        odds: bet.odds,
                        stake: bet.stake,
                        timestamp: new Date().toISOString(),
                  }],
                  totalStake: bet.stake,
                  timestamp: new Date().toISOString(),
            };
      }

      // Create bet slip (step 1 of bet placement)
      static async createBetSlip(bets: BetSlipItem[], totalStake: number, userId?: string, isMultibet?: boolean): Promise<BetSlipResponse> {
            try {
                  const finalUserId = userId || this.getUserId();

                  for (const bet of bets) {
                        if (!bet.gameId) {
                              throw new Error(`Missing gameId for bet: ${bet.homeTeam} vs ${bet.awayTeam}`);
                        }
                        if (!bet.homeTeam) {
                              throw new Error(`Missing homeTeam for bet: ${bet.gameId}`);
                        }
                        if (!bet.awayTeam) {
                              throw new Error(`Missing awayTeam for bet: ${bet.gameId}`);
                        }
                        if (!bet.betType) {
                              throw new Error(`Missing betType for bet: ${bet.homeTeam} vs ${bet.awayTeam}`);
                        }
                        if (!bet.selection) {
                              throw new Error(`Missing selection for bet: ${bet.homeTeam} vs ${bet.awayTeam}`);
                        }
                        if (!bet.odds || bet.odds <= 0) {
                              throw new Error(`Invalid odds (${bet.odds}) for bet: ${bet.homeTeam} vs ${bet.awayTeam}`);
                        }
                        // Only validate individual stakes for single bets, not multibets
                        if (!isMultibet && (!bet.stake || bet.stake <= 0)) {
                              throw new Error(`Invalid stake (${bet.stake}) for bet: ${bet.homeTeam} vs ${bet.awayTeam}`);
                        }
                  }

                  const betSlipData = {
                        userId: finalUserId,
                        selections: bets.map(bet => {
                              const internalMarket = bet.marketKey || this.deriveMarketTypeFromBetType(bet.betType);
                              const marketType = ensureAllowedMarketType(
                                    internalMarket,
                                    bet.betType
                              );
                              // const apiMarketKey = this.getApiMarketKeyForBet(bet);
                              const outcome = this.deriveOutcomeForMarket(bet, marketType);

                              const selectionData = {
                                    gameId: bet.gameId,
                                    homeTeam: bet.homeTeam,
                                    awayTeam: bet.awayTeam,
                                    marketType: toApiMarketKey(marketType),
                                    outcome: outcome,
                                    odds: {
                                          decimal: parseFloat(bet.odds.toFixed(2)),
                                          american: this.decimalToAmerican(bet.odds),
                                          multiplier: parseFloat(bet.odds.toFixed(2))
                                    },
                                    bookmaker: 'Betzone',
                                    gameTime: bet.gameTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                                    sportKey: bet.sportKey || 'soccer_epl'
                              };

                              return selectionData;
                        }),
                        stake: totalStake
                  };

                  const response = await axios.post(
                        `${API_BASE_URL}/bets/slip`,
                        betSlipData,
                        {
                              headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                              },
                        }
                  );

                  if (!response.data.success) {
                        throw new Error(`Bet slip creation failed: ${response.data.message || 'Unknown error'}`);
                  }
                  return response.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Helper method to convert decimal odds to American
      public static decimalToAmerican(decimal: number): number {
            if (decimal >= 2.0) {
                  return Math.round((decimal - 1) * 100);
            } else {
                  return Math.round(-100 / (decimal - 1));
            }
      }

      // Place single bets (multiple individual bets)
      static async placeSingleBets(bets: BetSlipItem[], userId?: string): Promise<BetResponse[]> {
            try {
                  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);

                  // Step 1: Create bet slip
                  const betSlip = await this.createBetSlip(bets, totalStake, userId, false);

                  // Check for the ID field - backend returns it in betSlipId, not id
                  const betSlipId = betSlip.data?.betSlipId || betSlip.data?.betSlip?.id;

                  if (!betSlip.success || !betSlipId) {
                        throw new Error('Failed to create bet slip');
                  }

                  const placeBetData = {
                        userId: userId,
                        betSlipId: betSlipId
                  };

                  const authToken = localStorage.getItem('authToken');

                  const response = await axios.post(
                        `${API_BASE_URL}/bets/place`,
                        placeBetData,
                        {
                              headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${authToken}`,
                              },
                        }
                  );

                  if (!response.data.success) {
                        throw new Error(`Bet placement failed: ${response.data.message || 'Unknown error'}`);
                  }

                  // The API returns an array of bet results
                  return response.data.bets || [response.data];
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Place multibet (combined bet)
      static async placeMultibet(
            bets: BetSlipItem[],
            totalStake: number,
            userId?: string
      ): Promise<BetResponse> {
            try {
                  const betSlip = await this.createBetSlip(bets, totalStake, userId, true);
                  const betSlipId = betSlip.data?.betSlipId || betSlip.data?.betSlip?.id;

                  if (!betSlip.success || !betSlipId) {
                        throw new Error('Failed to create bet slip');
                  }

                  const placeBetData = {
                        userId: userId,
                        betSlipId: betSlipId
                  };

                  const authToken = localStorage.getItem('authToken');

                  const response = await axios.post(
                        `${API_BASE_URL}/bets/place`,
                        placeBetData,
                        {
                              headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${authToken}`,
                              },
                        }
                  );

                  if (!response.data.success) {
                        throw new Error(`Bet placement failed: ${response.data.message || 'Unknown error'}`);
                  }

                  return response.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Validate betslip before sending
      static validateBetslip(bets: BetSlipItem[], userBettingLimits?: any): { isValid: boolean; errors: string[] } {
            const errors: string[] = [];

            if (bets.length === 0) {
                  errors.push('No bets in slip');
            }

            // Validate bet data structure
            for (const bet of bets) {
                  if (!bet.gameId) {
                        errors.push(`Missing game ID for bet on ${bet.homeTeam} vs ${bet.awayTeam}`);
                  }
                  if (!bet.homeTeam) {
                        errors.push(`Missing home team for bet ${bet.id}`);
                  }
                  if (!bet.awayTeam) {
                        errors.push(`Missing away team for bet ${bet.id}`);
                  }
                  if (!bet.betType) {
                        errors.push(`Missing bet type for bet on ${bet.homeTeam} vs ${bet.awayTeam}`);
                  }
                  if (!bet.selection) {
                        errors.push(`Missing selection for bet on ${bet.homeTeam} vs ${bet.awayTeam}`);
                  }
                  if (!bet.odds || bet.odds <= 0) {
                        errors.push(`Invalid odds (${bet.odds}) for bet on ${bet.homeTeam} vs ${bet.awayTeam}`);
                  }
                  if (!bet.stake || bet.stake <= 0) {
                        errors.push(`Invalid stake (${bet.stake}) for bet on ${bet.homeTeam} vs ${bet.awayTeam}`);
                  }
            }

            // Check for minimum and maximum stakes based on user limits
            const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);

            if (userBettingLimits) {
                  // Use user's betting limits if available
                  if (totalStake < userBettingLimits.minStake) {
                        errors.push(`Minimum stake is ${userBettingLimits.currency || '$'}${userBettingLimits.minStake.toFixed(2)}`);
                  }

                  if (totalStake > userBettingLimits.maxStake) {
                        errors.push(`Maximum stake is ${userBettingLimits.currency || '$'}${userBettingLimits.maxStake.toFixed(2)}`);
                  }

                  // Check individual bet stakes
                  for (const bet of bets) {
                        if (bet.stake < userBettingLimits.minStake) {
                              errors.push(`Bet on ${bet.homeTeam} vs ${bet.awayTeam}: Minimum stake is ${userBettingLimits.currency || '$'}${userBettingLimits.minStake.toFixed(2)}`);
                        }

                        if (bet.stake > userBettingLimits.maxStake) {
                              errors.push(`Bet on ${bet.homeTeam} vs ${bet.awayTeam}: Maximum stake is ${userBettingLimits.currency || '$'}${userBettingLimits.maxStake.toFixed(2)}`);
                        }
                  }
            } else {
                  // Fallback to default limits
                  if (totalStake < 1) {
                        errors.push('Minimum stake is SSP 1');
                  }

                  if (totalStake > 10000) {
                        errors.push('Maximum stake is SSP 10,000');
                  }
            }

            // Check for conflicting bets (same game, different outcomes)
            const gameSelections = new Map<string, Set<string>>();

            for (const bet of bets) {
                  if (!gameSelections.has(bet.gameId)) {
                        gameSelections.set(bet.gameId, new Set());
                  }
                  gameSelections.get(bet.gameId)!.add(bet.selection);
            }

            gameSelections.forEach((selections, gameId) => {
                  if (selections.size > 1) {
                        const game = bets.find(b => b.gameId === gameId);
                        errors.push(`Conflicting selections for ${game?.homeTeam} vs ${game?.awayTeam}`);
                  }
            });

            // Check if user is authenticated
            try {
                  this.getUserId();
            } catch (error) {
                  errors.push('User not authenticated');
            }

            const result = {
                  isValid: errors.length === 0,
                  errors,
            };

            return result;
      }

      // Validate multibet specifically
      static validateMultibet(bets: BetSlipItem[], totalStake: number, userBettingLimits?: any): { isValid: boolean; errors: string[] } {
            const errors: string[] = [];

            if (bets.length < 2) {
                  errors.push('Multibet requires at least 2 selections');
            }

            if (bets.length > 20) {
                  errors.push('Multibet cannot exceed 20 selections');
            }

            // Check for conflicting bets
            const gameSelections = new Map<string, Set<string>>();

            for (const bet of bets) {
                  if (!gameSelections.has(bet.gameId)) {
                        gameSelections.set(bet.gameId, new Set());
                  }
                  gameSelections.get(bet.gameId)!.add(bet.selection);
            }

            gameSelections.forEach((selections, gameId) => {
                  if (selections.size > 1) {
                        const game = bets.find(b => b.gameId === gameId);
                        errors.push(`Conflicting selections for ${game?.homeTeam} vs ${game?.awayTeam}`);
                  }
            });

            // Validate multibet stake against user limits
            if (userBettingLimits) {

                  if (totalStake < userBettingLimits.minStake) {
                        errors.push(`Multibet minimum stake is ${userBettingLimits.currency || '$'}${userBettingLimits.minStake.toFixed(2)}`);
                  }

                  if (totalStake > userBettingLimits.maxStake) {
                        errors.push(`Multibet maximum stake is ${userBettingLimits.currency || '$'}${userBettingLimits.maxStake.toFixed(2)}`);
                  }
            } else {
                  // Fallback to default limits
                  if (totalStake < 1) {
                        errors.push('Multibet minimum stake is SSP 1');
                  }

                  if (totalStake > 10000) {
                        errors.push('Multibet maximum stake is SSP 10,000');
                  }
            }

            const result = {
                  isValid: errors.length === 0,
                  errors,
            };

            return result;
      }

      // Get bet history for user
      static async getBetHistory(): Promise<any[]> {
            try {
                  const userId = this.getUserId();

                  const response = await axios.get(
                        `${API_BASE_URL}/bets/history/${userId}`,
                        {
                              headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('betzone_token')}`,
                              },
                        }
                  );

                  return response.data.bets;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Get bet status
      static async getBetStatus(betId: string): Promise<any> {
            try {
                  const response = await axios.get(
                        `${API_BASE_URL}/bets/status/${betId}`,
                        {
                              headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('betzone_token')}`,
                              },
                        }
                  );

                  return response.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Validate bet selections
      static async validateSelections(bets: BetSlipItem[]): Promise<{ success: boolean; data: { isValid: boolean; errors: string[] } }> {
            try {
                  const validationData = {
                        selections: bets.map(bet => {
                              const internalMarket = bet.marketKey || this.deriveMarketTypeFromBetType(bet.betType);
                              const marketType = ensureAllowedMarketType(
                                    internalMarket,
                                    bet.betType
                              );
                              // const apiMarketKey = this.getApiMarketKeyForBet(bet);
                              const outcome = this.deriveOutcomeForMarket(bet, marketType);
                              return {
                                    gameId: bet.gameId,
                                    marketType: toApiMarketKey(marketType),
                                    outcome,
                                    odds: { decimal: bet.odds, american: this.decimalToAmerican(bet.odds), multiplier: bet.odds }
                              };
                        })
                  };


                  const response = await axios.post(
                        `${API_BASE_URL}/bets/validate`,
                        validationData,
                        {
                              headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                              },
                        }
                  );

                  return response.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Error handling
      private static handleError(error: any): Error {
            if (error.response) {
                  const errorData: BetError = error.response.data;
                  if (error.response.status === 401) {
                        return new Error('User not authenticated. Please log in again.');
                  }
                  const errorMessage = errorData.error || errorData.message || 'Bet placement failed';
                  return new Error(`Server error: ${errorMessage}`);
            }
            if (error.request) {
                  return new Error('Network error - please check your connection and ensure the backend is running');
            }
            if (error.message) return new Error(error.message);
            return new Error(`An unexpected error occurred: ${error.toString()}`);
      }
}

// Example usage functions
export const placeBets = async (
      bets: BetSlipItem[],
      isMultibet: boolean,
      multibetStake?: number,
      userId?: string,
      userBettingLimits?: any
): Promise<BetResponse | BetResponse[]> => {

      // Validate betslip first
      const validation = isMultibet
            ? BetSlipService.validateMultibet(bets, multibetStake || 0, userBettingLimits)
            : BetSlipService.validateBetslip(bets, userBettingLimits);

      if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
      }

      // Place bets based on type
      if (isMultibet && multibetStake) {
            return await BetSlipService.placeMultibet(bets, multibetStake, userId);
      } else {
            return await BetSlipService.placeSingleBets(bets, userId);
      }
};

// Example of how to use in your Header component:
/*
import { placeBets } from '../services/betslipService';

const handlePlaceBets = async () => {
  try {
    const result = await placeBets(betSlipItems, isMultibetMode, multibetStake);
    
    if (Array.isArray(result)) {
      // Single bets
    } else {
      // Multibet
    }
    
    // Clear betslip after successful placement
    dispatch(clearBetSlip());
    
  } catch (error) {
    // Show error to user
  }
};
*/ 