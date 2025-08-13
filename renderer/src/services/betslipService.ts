import axios from 'axios';
import { BetSlipItem } from '../store/betslipSlice';
import { BetSlip } from '../types/bets';
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
      static async createBetSlip(bets: BetSlipItem[], totalStake: number, userId?: string): Promise<{ success: boolean; data: BetSlip }> {
            try {
                  console.log('createBetSlip called with:', { bets, totalStake, userId });

                  const finalUserId = userId || this.getUserId();
                  console.log('Using userId:', finalUserId);

                  const betSlipData = {
                        userId: finalUserId,
                        selections: bets.map(bet => {
                              // Map generic selections to actual team names or specific outcomes
                              let outcome: string;
                              const selection = bet.selection.toLowerCase();
                              switch (selection) {
                                    case 'home':
                                          outcome = bet.homeTeam;
                                          break;
                                    case 'away':
                                          outcome = bet.awayTeam;
                                          break;
                                    case 'draw':
                                          outcome = 'Draw';
                                          break;
                                    case 'over':
                                          outcome = 'Over 2.5';
                                          break;
                                    case 'under':
                                          outcome = 'Under 2.5';
                                          break;
                                    case 'yes':
                                          outcome = 'Yes';
                                          break;
                                    case 'no':
                                          outcome = 'No';
                                          break;
                                    default:
                                          // For other bet types, use the selection as is
                                          outcome = bet.selection;
                              }

                              const selectionData = {
                                    gameId: bet.gameId,
                                    homeTeam: bet.homeTeam,
                                    awayTeam: bet.awayTeam,
                                    marketType: 'h2h', // Default market type
                                    outcome: outcome,
                                    odds: { decimal: bet.odds, american: this.decimalToAmerican(bet.odds), multiplier: bet.odds },
                                    bookmaker: 'BetZone',
                                    gameTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow
                                    sportKey: 'soccer_epl' // Default sport
                              };

                              console.log(`Mapping selection: "${bet.selection}" -> "${outcome}" for ${bet.homeTeam} vs ${bet.awayTeam}`);
                              console.log(`Original bet data:`, bet);
                              console.log(`Mapped selection data:`, selectionData);
                              return selectionData;
                        }),
                        stake: totalStake
                  };

                  console.log('Creating bet slip with data:', JSON.stringify(betSlipData, null, 2));

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

                  return response.data;
            } catch (error: any) {
                  console.error('Failed to create bet slip:', error);
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
                  if (!betSlip.success || !betSlip.data?.id) {
                        throw new Error('Failed to create bet slip');
                  }

                  // Step 2: Place bet using bet slip ID
                  const placeBetData = {
                        userId: userId,
                        betSlipId: betSlip.data.id
                  };

                  console.log('Placing single bets with userId:', userId, 'and bet slip ID:', betSlip.data.id);
                  console.log('Place bet data:', placeBetData);

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
                  // Calculate combined odds
                  const combinedOdds = bets.reduce((total, bet) => total * bet.odds, 1);
                  const potentialWinnings = totalStake * combinedOdds;

                  // Step 1: Create bet slip
                  const betSlip = await this.createBetSlip(bets, totalStake, userId);
                  if (!betSlip.success || !betSlip.data?.id) {
                        throw new Error('Failed to create bet slip');
                  }

                  // Step 2: Place bet using bet slip ID
                  const placeBetData = {
                        userId: userId,
                        betSlipId: betSlip.data.id
                  };

                  console.log('Placing multibet with userId:', userId, 'and bet slip ID:', betSlip.data.id);
                  console.log('Place bet data:', placeBetData);

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

                  return response.data;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Validate betslip before sending
      static validateBetslip(bets: BetSlipItem[]): { isValid: boolean; errors: string[] } {
            const errors: string[] = [];

            if (bets.length === 0) {
                  errors.push('No bets in slip');
            }

            // Check for minimum stake
            const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
            if (totalStake < 1) {
                  errors.push('Minimum stake is $1');
            }

            if (totalStake > 10000) {
                  errors.push('Maximum stake is $10,000');
            }

            // Check for conflicting bets (same game, different outcomes)
            const gameSelections = new Map<string, Set<string>>();

            for (const bet of bets) {
                  if (!gameSelections.has(bet.gameId)) {
                        gameSelections.set(bet.gameId, new Set());
                  }
                  gameSelections.get(bet.gameId)!.add(bet.selection);
            }

            for (const [gameId, selections] of gameSelections) {
                  if (selections.size > 1) {
                        const game = bets.find(b => b.gameId === gameId);
                        errors.push(`Conflicting selections for ${game?.homeTeam} vs ${game?.awayTeam}`);
                  }
            }

            // Check if user is authenticated
            try {
                  this.getUserId();
            } catch (error) {
                  errors.push('User not authenticated');
            }

            return {
                  isValid: errors.length === 0,
                  errors,
            };
      }

      // Validate multibet specifically
      static validateMultibet(bets: BetSlipItem[]): { isValid: boolean; errors: string[] } {
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

            for (const [gameId, selections] of gameSelections) {
                  if (selections.size > 1) {
                        const game = bets.find(b => b.gameId === gameId);
                        errors.push(`Conflicting selections for ${game?.homeTeam} vs ${game?.awayTeam}`);
                  }
            }

            return {
                  isValid: errors.length === 0,
                  errors,
            };
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
                        selections: bets.map(bet => ({
                              gameId: bet.gameId,
                              marketType: 'h2h',
                              outcome: bet.selection,
                              odds: { decimal: bet.odds, american: this.decimalToAmerican(bet.odds), multiplier: bet.odds }
                        }))
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
            if (error.response) {
                  // Server responded with error status
                  const errorData: BetError = error.response.data;
                  return new Error(errorData.error || 'Bet placement failed');
            } else if (error.request) {
                  // Network error
                  return new Error('Network error - please check your connection');
            } else {
                  // Other error
                  return new Error('An unexpected error occurred');
            }
      }
}

// Example usage functions
export const placeBets = async (
      bets: BetSlipItem[],
      isMultibet: boolean,
      multibetStake?: number,
      userId?: string
): Promise<BetResponse | BetResponse[]> => {
      // Validate betslip first
      const validation = isMultibet
            ? BetSlipService.validateMultibet(bets)
            : BetSlipService.validateBetslip(bets);

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