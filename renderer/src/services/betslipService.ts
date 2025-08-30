import axios from 'axios';
import { BetSlipItem } from '../store/betslipSlice';
import { BetSlip, BetSlipResponse } from '../types/bets';
import { API_BASE_URL } from './apiConfig';

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
            console.log('getUserId called - checking localStorage for user data...');

            // Try multiple sources for user ID
            // 1. First try betzone_user (Redux auth state)
            const user = localStorage.getItem('betzone_user');
            console.log('betzone_user from localStorage:', user);
            if (user) {
                  try {
                        const userData = JSON.parse(user);
                        console.log('Parsed betzone_user data:', userData);
                        if (userData.id) {
                              console.log('Found userId from betzone_user:', userData.id);
                              return userData.id;
                        }
                  } catch (error) {
                        console.error('Error parsing betzone_user:', error);
                  }
            }

            // 2. Try authUser (direct auth service)
            const authUser = localStorage.getItem('authUser');
            console.log('authUser from localStorage:', authUser);
            if (authUser) {
                  try {
                        const userData = JSON.parse(authUser);
                        console.log('Parsed authUser data:', userData);
                        if (userData.id) {
                              console.log('Found userId from authUser:', userData.id);
                              return userData.id;
                        }
                  } catch (error) {
                        console.error('Error parsing authUser:', error);
                  }
            }

            // 3. Try to get from Redux store if available
            // This is a fallback for when the service is called from a React component
            // Note: Cannot directly access Redux store from service layer

            // 4. Check if we have an auth token (user should be logged in)
            const authToken = localStorage.getItem('authToken');
            console.log('authToken from localStorage:', authToken);
            if (!authToken) {
                  console.error('No auth token found - user not authenticated');
                  throw new Error('User not authenticated - no auth token found');
            }

            // If we have a token but no user ID, this suggests a login flow issue
            console.error('Auth token found but no user ID - login flow issue');
            throw new Error('User ID not found. Please try logging in again or refresh the page.');
      }

      private static deriveMarketTypeFromBetType(betType: string): string {
            const key = (betType || '').toLowerCase();

            // Handle Double Chance markets
            if (key.includes('double')) return 'double_chance';

            // Handle Over/Under markets
            if (key.includes('over/under') || key.includes('over') || key.includes('under')) return 'totals';

            // Handle Both Teams To Score markets
            if (key.includes('both') || key.includes('btts')) return 'btts';

            // Handle Head-to-Head markets (3 Way, H2H, etc.)
            if (key.includes('3 way') || key.includes('3-way') || key.includes('1x2') || key.includes('match') || key.includes('h2h') || key.includes('spread')) return 'h2h';

            // Default to H2H for any unrecognized bet types
            return 'h2h';
      }

      private static deriveOutcomeForMarket(bet: BetSlipItem, marketType: string): string {
            const selection = (bet.selection || '').toLowerCase();

            switch (marketType) {
                  case 'h2h':
                        // Handle H2H selections (Home, Draw, Away)
                        if (selection === 'home') return bet.homeTeam;
                        if (selection === 'away') return bet.awayTeam;
                        if (selection === 'draw') return 'Draw';

                        // Handle Spread selections
                        if (selection === 'home') return bet.homeTeam;
                        if (selection === 'away') return bet.awayTeam;

                        return bet.selection;

                  case 'double_chance': {
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
                        return bet.selection;
                  }

                  case 'totals': {
                        // Handle Over/Under selections
                        if (selection === 'over') return 'Over';
                        if (selection === 'under') return 'Under';
                        return bet.selection;
                  }

                  case 'btts': {
                        // Handle Both Teams To Score selections
                        if (selection === 'yes' || selection === 'no') {
                              return bet.selection.charAt(0).toUpperCase() + bet.selection.slice(1).toLowerCase();
                        }
                        return bet.selection;
                  }

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
      static async createBetSlip(bets: BetSlipItem[], totalStake: number, userId?: string): Promise<BetSlipResponse> {
            try {
                  console.log('=== CREATE BET SLIP DEBUG ===');
                  console.log('createBetSlip called with:', {
                        betsCount: bets.length,
                        totalStake,
                        userId,
                        bets: bets.map(b => ({
                              gameId: b.gameId,
                              homeTeam: b.homeTeam,
                              awayTeam: b.awayTeam,
                              betType: b.betType,
                              selection: b.selection,
                              odds: b.odds,
                              stake: b.stake
                        }))
                  });

                  const finalUserId = userId || this.getUserId();
                  console.log('Using userId:', finalUserId);

                  // Validate each bet before processing
                  for (const bet of bets) {
                        console.log('Validating bet:', {
                              gameId: bet.gameId,
                              homeTeam: bet.homeTeam,
                              awayTeam: bet.awayTeam,
                              betType: bet.betType,
                              selection: bet.selection,
                              odds: bet.odds,
                              stake: bet.stake,
                              gameTime: bet.gameTime,
                              sportKey: bet.sportKey
                        });

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
                        if (!bet.stake || bet.stake <= 0) {
                              throw new Error(`Invalid stake (${bet.stake}) for bet: ${bet.homeTeam} vs ${bet.awayTeam}`);
                        }
                  }

                  const betSlipData = {
                        userId: finalUserId,
                        selections: bets.map(bet => {
                              const marketType = this.deriveMarketTypeFromBetType(bet.betType);
                              const outcome = this.deriveOutcomeForMarket(bet, marketType);

                              console.log(`Mapping bet data:`);
                              console.log(`  Original selection: "${bet.selection}"`);
                              console.log(`  Mapped outcome: "${outcome}"`);
                              console.log(`  Original betType: "${bet.betType}"`);
                              console.log(`  Mapped marketType: "${marketType}"`);

                              const selectionData = {
                                    gameId: bet.gameId,
                                    homeTeam: bet.homeTeam,
                                    awayTeam: bet.awayTeam,
                                    marketType: marketType,
                                    outcome: outcome,
                                    odds: {
                                          decimal: bet.odds,
                                          american: this.decimalToAmerican(bet.odds),
                                          multiplier: bet.odds
                                    },
                                    bookmaker: 'BetZone',
                                    gameTime: bet.gameTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                                    sportKey: bet.sportKey || 'soccer_epl'
                              };

                              console.log(`Final selection data:`, selectionData);
                              return selectionData;
                        }),
                        stake: totalStake
                  };

                  console.log('=== FINAL BET SLIP DATA ===');
                  console.log('Creating bet slip with data:', JSON.stringify(betSlipData, null, 2));

                  console.log('=== API REQUEST DETAILS ===');
                  console.log('Making request to:', `${API_BASE_URL}/bets/slip`);
                  console.log('Request headers:', {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') ? 'TOKEN_PRESENT' : 'NO_TOKEN'}`
                  });
                  console.log('Auth token exists:', !!localStorage.getItem('authToken'));

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

                  console.log('=== API RESPONSE ===');
                  console.log('Bet slip creation response status:', response.status);
                  console.log('Bet slip creation response data:', response.data);

                  if (!response.data.success) {
                        console.error('Bet slip creation failed:', response.data);
                        throw new Error(`Bet slip creation failed: ${response.data.message || 'Unknown error'}`);
                  }

                  console.log('=== BET SLIP CREATED SUCCESSFULLY ===');
                  return response.data;
            } catch (error: any) {
                  console.error('=== BET SLIP CREATION ERROR ===');
                  console.error('Failed to create bet slip:', error);
                  console.error('Error details:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        statusText: error.response?.statusText
                  });
                  throw this.handleError(error);
            }
      }

      // Helper method to convert decimal odds to American
      private static decimalToAmerican(decimal: number): number {
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
                  const betSlip = await this.createBetSlip(bets, totalStake, userId);

                  // Check for the ID field - backend returns it in betSlipId, not id
                  const betSlipId = betSlip.data?.betSlipId || betSlip.data?.betSlip?.id;

                  if (!betSlip.success || !betSlipId) {
                        console.error('Bet slip creation failed:', {
                              success: betSlip.success,
                              data: betSlip.data,
                              hasBetSlipId: !!betSlip.data?.betSlipId,
                              hasNestedId: !!betSlip.data?.betSlip?.id,
                              foundId: betSlipId
                        });
                        throw new Error('Failed to create bet slip');
                  }

                  // Step 2: Place bet using bet slip ID
                  const placeBetData = {
                        userId: userId,
                        betSlipId: betSlipId
                  };

                  console.log('Placing single bets with userId:', userId, 'and bet slip ID:', betSlipId);
                  console.log('Place bet data:', placeBetData);
                  console.log('Making request to:', `${API_BASE_URL}/bets/place`);
                  console.log('Request headers:', {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') ? 'TOKEN_PRESENT' : 'NO_TOKEN'}`
                  });

                  const response = await axios.post(
                        `${API_BASE_URL}/bets/place`,
                        placeBetData,
                        {
                              headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                              },
                        }
                  );

                  console.log('Bet placement response:', response.data);

                  if (!response.data.success) {
                        console.error('Bet placement failed:', response.data);
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
                  console.log('=== PLACE MULTIBET DEBUG ===');
                  console.log('placeMultibet called with:', {
                        betsCount: bets.length,
                        totalStake,
                        userId,
                        bets: bets.map(b => ({
                              gameId: b.gameId,
                              homeTeam: b.homeTeam,
                              awayTeam: b.awayTeam,
                              betType: b.betType,
                              selection: b.selection,
                              odds: b.odds,
                              stake: b.stake
                        }))
                  });

                  // Calculate combined odds
                  const combinedOdds = bets.reduce((total, bet) => total * bet.odds, 1);
                  const potentialWinnings = totalStake * combinedOdds;

                  console.log('Calculated values:', {
                        combinedOdds,
                        potentialWinnings,
                        totalStake
                  });

                  // Step 1: Create bet slip
                  console.log('Step 1: Creating bet slip...');
                  const betSlip = await this.createBetSlip(bets, totalStake, userId);

                  console.log('Bet slip creation result:', betSlip);

                  // Debug the data structure
                  console.log('=== BET SLIP DATA STRUCTURE DEBUG ===');
                  console.log('betSlip.success:', betSlip.success);
                  console.log('betSlip.data:', betSlip.data);
                  console.log('betSlip.data?.betSlipId:', betSlip.data?.betSlipId);
                  console.log('Full betSlip structure:', JSON.stringify(betSlip, null, 2));

                  // Check for the ID field - backend returns it in betSlipId, not id
                  const betSlipId = betSlip.data?.betSlipId || betSlip.data?.betSlip?.id;

                  if (!betSlip.success || !betSlipId) {
                        console.error('Bet slip creation failed:', {
                              success: betSlip.success,
                              data: betSlip.data,
                              hasBetSlipId: !!betSlip.data?.betSlipId,
                              hasNestedId: !!betSlip.data?.betSlip?.id,
                              foundId: betSlipId
                        });
                        throw new Error('Failed to create bet slip');
                  }

                  // Step 2: Place bet using bet slip ID
                  const placeBetData = {
                        userId: userId,
                        betSlipId: betSlipId
                  };

                  console.log('Placing multibet with userId:', userId, 'and bet slip ID:', betSlipId);
                  console.log('Place bet data:', placeBetData);
                  console.log('Making request to:', `${API_BASE_URL}/bets/place`);
                  console.log('Request headers:', {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') ? 'TOKEN_PRESENT' : 'NO_TOKEN'}`
                  });

                  const response = await axios.post(
                        `${API_BASE_URL}/bets/place`,
                        placeBetData,
                        {
                              headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                              },
                        }
                  );

                  console.log('Multibet placement response:', response.data);

                  if (!response.data.success) {
                        console.error('Multibet placement failed:', response.data);
                        throw new Error(`Multibet placement failed: ${response.data.message || 'Unknown error'}`);
                  }

                  return response.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Validate betslip before sending
      static validateBetslip(bets: BetSlipItem[], userBettingLimits?: any): { isValid: boolean; errors: string[] } {
            console.log('Validating betslip with bets:', bets);
            console.log('User betting limits:', userBettingLimits);
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
                  console.log('Validating against user betting limits:', userBettingLimits);

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
                  console.log('No user betting limits provided, using defaults');
                  // Fallback to default limits
                  if (totalStake < 1) {
                        errors.push('Minimum stake is $1');
                  }

                  if (totalStake > 10000) {
                        errors.push('Maximum stake is $10,000');
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

            console.log('Betslip validation result:', result);
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
                  console.log('Validating multibet against user betting limits:', userBettingLimits);

                  if (totalStake < userBettingLimits.minStake) {
                        errors.push(`Multibet minimum stake is ${userBettingLimits.currency || '$'}${userBettingLimits.minStake.toFixed(2)}`);
                  }

                  if (totalStake > userBettingLimits.maxStake) {
                        errors.push(`Multibet maximum stake is ${userBettingLimits.currency || '$'}${userBettingLimits.maxStake.toFixed(2)}`);
                  }
            } else {
                  console.log('No user betting limits for multibet, using defaults');
                  // Fallback to default limits
                  if (totalStake < 1) {
                        errors.push('Multibet minimum stake is $1');
                  }

                  if (totalStake > 10000) {
                        errors.push('Multibet maximum stake is $10,000');
                  }
            }

            const result = {
                  isValid: errors.length === 0,
                  errors,
            };

            console.log('Multibet validation result:', result);
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
                              const marketType = this.deriveMarketTypeFromBetType(bet.betType);
                              const outcome = this.deriveOutcomeForMarket(bet, marketType);
                              return {
                                    gameId: bet.gameId,
                                    marketType,
                                    outcome,
                                    odds: { decimal: bet.odds, american: this.decimalToAmerican(bet.odds), multiplier: bet.odds }
                              };
                        })
                  };

                  console.log('Validating selections with data:', validationData);

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
            console.error('handleError called with:', error);

            if (error.response) {
                  // Server responded with error status
                  console.error('Server error response:', error.response);
                  const errorData: BetError = error.response.data;
                  const errorMessage = errorData.error || errorData.message || 'Bet placement failed';
                  return new Error(`Server error: ${errorMessage}`);
            } else if (error.request) {
                  // Network error
                  console.error('Network error:', error.request);
                  return new Error('Network error - please check your connection and ensure the backend is running');
            } else if (error.message) {
                  // Error with message
                  console.error('Error with message:', error.message);
                  return new Error(error.message);
            } else {
                  // Other error
                  console.error('Unexpected error:', error);
                  return new Error(`An unexpected error occurred: ${error.toString()}`);
            }
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
      console.log('placeBets called with userBettingLimits:', userBettingLimits);

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
      console.log('Placed', result.length, 'single bets');
      result.forEach(bet => {
        console.log('Bet ID:', bet.betId, 'Status:', bet.status);
      });
    } else {
      // Multibet
      console.log('Placed multibet:', result.betId, 'Status:', result.status);
    }
    
    // Clear betslip after successful placement
    dispatch(clearBetSlip());
    
  } catch (error) {
    console.error('Failed to place bets:', error.message);
    // Show error to user
  }
};
*/ 