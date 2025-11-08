export interface GameScore {
      homeScore?: number;
      awayScore?: number;
      halftimeHomeScore?: number;
      halftimeAwayScore?: number;
      finalScore?: string;
      gameStatus?: string;
      gameTime?: string | null;
      lastUpdated?: string | null;
      period?: string;
      status?: string;
}

export interface OddsStructure {
      decimal: number;
      american: number;
      multiplier: number;
}

export interface BetHistorySelection {
      selectionId: string;               // Individual bet selection ID (from bet_selections table)
      betId: string;                    // Parent bet ID (from bets table)
      gameId: string;                   // Game identifier
      homeTeam: string;                 // Home team name
      awayTeam: string;                 // Away team name
      betType: string;                  // Market type (e.g., "h2h", "totals", "double_chance", "btts")
      selection: string;                // Selected outcome (e.g., "Chelsea", "Draw or Away", "Over 2.5")
      gameScore?: GameScore;            // Current game scores and status details
      odds?: OddsStructure;             // Selection odds with decimal, american, multiplier
      stake?: number;                   // Individual selection stake
      potentialWinnings?: number;       // Individual selection potential winnings
      result?: string;                  // Selection result
      selectionOutcome?: string;        // "won", "lost", "pending", "void"
      selectionSettlementReason?: string; // Reason for settlement (e.g., "Home team won", "Total goals (4) exceeded 2.5")
}

export interface ShopInfo {
      id: string;
      shopName: string;
      shopCode: string;
      shopAddress?: string;
      shopPhone?: string;
      shopEmail?: string;
      contactPerson?: string;
}

export interface UserInfo {
      id: string;
      phoneNumber: string;
      countryCode: string;
      role: string;
}

export interface DisplayBetSelection extends BetHistorySelection {
      // INDIVIDUAL SELECTION ODDS - Odds for this specific selection within the bet
      // Contains decimal, american, and multiplier values
      odds?: OddsStructure;
      stake?: number;
      potentialWinnings?: number;
      result?: string;
}

export interface PaymentStatus {
      status: 'paid' | 'pending' | 'failed' | 'cancelled' | 'no_payout' | 'no_payment_needed';
      message: string;
      payoutId?: string;
      payoutAmount?: number;
      paymentMethod?: string;
      processedAt?: string;
      reference?: string;
}

export interface DisplayBet {
      betId: string;
      betType: "single" | "multibet";
      totalStake: number;
      potentialWinnings: number;
      actualWinnings?: number;
      createdAt?: string;
      timestamp?: string;                // Alternative timestamp field from API
      settledAt?: string;
      cancelledAt?: string;
      status: string;                    // "won", "lost", "pending", "accepted", "void"
      result?: 'won' | 'lost' | 'pending' | 'void';
      selections: DisplayBetSelection[];
      taxPercentage?: number;
      taxAmount?: number;
      netWinnings?: number;
      settlementReason?: string;         // Overall bet settlement reason
      // Payment status information
      paymentStatus?: PaymentStatus;
      // Shop and user information
      shop?: ShopInfo;
      user?: UserInfo;
      // COMBINED ODDS - Overall bet odds (for single bets, this equals the single selection odds)
      // For multibets: product of all selection odds
      // For single bets: same as the single selection odds
      combinedOdds?: number;
      // optional odds field might exist in API mapping
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
}

export interface ShopSummary {
      shopInfo: ShopInfo;
      totalBets: number;
      totalStake: number;
      totalPotentialWinnings: number;
      otherBetsInShop?: {
            singleBets: DisplayBet[];
            multibets: DisplayBet[];
            total: number;
      };
}

// API response structure
export interface NewBetHistoryResponse {
      success: boolean;
      data: {
            singleBets: DisplayBet[];
            multibets: DisplayBet[];
            total: number;
      };
}

// Helper functions for odds handling
export const OddsHelpers = {
      // Get decimal odds from individual selection
      getSelectionDecimalOdds: (selection: DisplayBetSelection): number | null => {
            return selection.odds?.decimal || null;
      },

      // Get american odds from individual selection
      getSelectionAmericanOdds: (selection: DisplayBetSelection): number | null => {
            return selection.odds?.american || null;
      },

      // Get multiplier odds from individual selection
      getSelectionMultiplierOdds: (selection: DisplayBetSelection): number | null => {
            return selection.odds?.multiplier || null;
      },

      // Get combined odds from bet (overall bet odds)
      getBetCombinedOdds: (bet: DisplayBet): number | null => {
            return bet.combinedOdds || null;
      },

      // Format decimal odds for display
      formatDecimalOdds: (odds: number | null): string => {
            return odds ? odds.toFixed(2) : 'N/A';
      },

      // Format american odds for display
      formatAmericanOdds: (odds: number | null): string => {
            if (odds === null) return 'N/A';
            return odds > 0 ? `+${odds}` : `${odds}`;
      }
};


