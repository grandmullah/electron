export interface Odds {
      decimal: number;
      american: number;
      multiplier: number;
}

export interface BetSelection {
      gameId: string;
      homeTeam: string;
      awayTeam: string;
      marketType: string;
      outcome: string;
      odds: Odds;
      bookmaker?: string;
      gameTime: string;
      sportKey: string;
      validation?: {
            oddsVerified: boolean;
            gameExists: boolean;
            oddsMatch: boolean;
      };
}

export interface BetSlip {
      id: string;
      userId: string;
      selections: BetSelection[];
      stake: number;
      potentialWinnings: number;
      taxPercentage?: number;
      taxAmount?: number;
      netWinnings?: number;
      odds: Odds;
      createdAt: string;
      expiresAt: string;
}

// Enhanced backend response structure
export interface BetSlipResponse {
      success: boolean;
      message: string;
      data: {
            betSlipId: string;
            betSlip: BetSlip;
            createdAt: string;
            expiresAt: string;
            netWinnings: number;
            odds: Odds;
            potentialWinnings: number;
            selections: BetSelection[];
            stake: number;
            taxAmount: number;
            userId: string;
            summary: {
                  totalSelections: number;
                  totalStake: number;
                  potentialWinnings: number;
                  combinedOdds: Odds;
            };
            details: {
                  betSlipId: string;
                  selectionsCount: number;
                  totalStake: number;
                  potentialWinnings: number;
                  taxInfo: {
                        percentage: number;
                        amount: number;
                        netWinnings: number;
                  };
                  expiryTime: string;
                  frontendData: {
                        canPlaceBet: boolean;
                        requiresConfirmation: boolean;
                        estimatedProcessingTime: string;
                  };
            };
            nextSteps: string[];
      };
}

export interface Bet extends Omit<BetSlip, 'expiresAt'> {
      status: 'pending' | 'accepted' | 'won' | 'lost' | 'cancelled' | 'void';
      updatedAt: string;
      settledAt?: string;
}
