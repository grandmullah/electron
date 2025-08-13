import axios from 'axios';
import { BetSlipItem } from '../store/betslipSlice';

// API base URL - adjust based on your backend
const API_BASE_URL = process.env.NODE_ENV === 'production'
      ? 'https://your-production-api.com/api'
      : 'http://localhost:8000/api';

// Types for API requests and responses
export interface SingleBetRequest {
      betId: string;
      gameId: string;
      homeTeam: string;
      awayTeam: string;
      betType: string;
      selection: string;
      odds: number;
      stake: number;
      potentialWinnings: number;
      userId: string;
      timestamp: string;
}

export interface MultibetRequest {
      betId: string;
      bets: SingleBetRequest[];
      totalStake: number;
      combinedOdds: number;
      potentialWinnings: number;
      userId: string;
      timestamp: string;
      betType: 'multibet';
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
            // Get user ID from your auth system
            // This should come from your Redux auth state or localStorage
            const user = localStorage.getItem('betzone_user');
            if (user) {
                  const userData = JSON.parse(user);
                  return userData.id;
            }
            throw new Error('User not authenticated');
      }

      // Convert betslip items to API format
      private static convertToSingleBetRequest(
            bet: BetSlipItem,
            userId: string
      ): SingleBetRequest {
            return {
                  betId: this.generateBetId(),
                  gameId: bet.gameId,
                  homeTeam: bet.homeTeam,
                  awayTeam: bet.awayTeam,
                  betType: bet.betType,
                  selection: bet.selection,
                  odds: bet.odds,
                  stake: bet.stake,
                  potentialWinnings: bet.potentialWinnings,
                  userId,
                  timestamp: new Date().toISOString(),
            };
      }

      // Place single bets (multiple individual bets)
      static async placeSingleBets(bets: BetSlipItem[]): Promise<BetResponse[]> {
            try {
                  const userId = this.getUserId();

                  const betRequests = bets.map(bet =>
                        this.convertToSingleBetRequest(bet, userId)
                  );

                  const response = await axios.post(
                        `${API_BASE_URL}/bets/single`,
                        {
                              bets: betRequests,
                              totalStake: bets.reduce((sum, bet) => sum + bet.stake, 0),
                              userId,
                              timestamp: new Date().toISOString(),
                        },
                        {
                              headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('betzone_token')}`,
                              },
                        }
                  );

                  return response.data.bets;
            } catch (error: any) {
                  throw this.handleError(error);
            }
      }

      // Place multibet (combined bet)
      static async placeMultibet(
            bets: BetSlipItem[],
            totalStake: number
      ): Promise<BetResponse> {
            try {
                  const userId = this.getUserId();

                  const betRequests = bets.map(bet =>
                        this.convertToSingleBetRequest(bet, userId)
                  );

                  const combinedOdds = bets.reduce((combined, bet) => combined * bet.odds, 1);
                  const potentialWinnings = totalStake * combinedOdds;

                  const multibetRequest: MultibetRequest = {
                        betId: this.generateBetId(),
                        bets: betRequests,
                        totalStake,
                        combinedOdds,
                        potentialWinnings,
                        userId,
                        timestamp: new Date().toISOString(),
                        betType: 'multibet',
                  };

                  const response = await axios.post(
                        `${API_BASE_URL}/bets/multibet`,
                        multibetRequest,
                        {
                              headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('betzone_token')}`,
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
      multibetStake?: number
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
            return await BetSlipService.placeMultibet(bets, multibetStake);
      } else {
            return await BetSlipService.placeSingleBets(bets);
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