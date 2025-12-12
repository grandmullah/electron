import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ManagedUser {
      id: string;
      phone_number: string;
      country_code: string;
      dial_code: string;
      role: 'user' | 'agent' | 'admin';
      balance: number;
      currency: string;
      createdAt: string;
      updatedAt: string;
      lastLoginAt: string | null;
      isActive: boolean;
      bettingLimits: {
            minStake: number;
            maxStake: number;
            maxDailyLoss: number;
            maxWeeklyLoss: number;
      };
      preferences: {
            oddsFormat: string;
            timezone: string;
            notifications: {
                  betSettled: boolean;
                  oddsChanged: boolean;
                  newGames: boolean;
            };
      };
}

// Type for agents (subset of ManagedUser for shop agents)
export interface ManagedAgent {
      id: string;
      phone_number: string;
      role: 'agent' | 'super_agent';
      balance: number;
      isActive: boolean;
      createdAt: string;
}

export interface AgentBet {
      id: string;
      userId: string;
      userPhone: string;
      userCountry: string;
      agentId: string;
      betType: 'single' | 'multibet';
      status: 'pending' | 'accepted' | 'rejected' | 'settled';
      totalStake: number;
      potentialWinnings: number;
      createdAt: string;
      updatedAt: string;
      settledAt: string | null;
      cancelledAt: string | null;
      selections: Array<{
            gameId: string;
            homeTeam: string;
            awayTeam: string;
            betType: string;
            selection: string;
            odds: number;
            stake: number;
            potentialWinnings: number;
      }>;
}

export interface CommissionTransaction {
      id: string;
      userId: string;
      userName: string;
      betId: string;
      amount: number;
      percentage: number;
      createdAt: string;
}

export interface AgentState {
      managedUsers: ManagedUser[];
      managedAgents: ManagedAgent[];
      agentBets: AgentBet[];
      commissionTransactions: CommissionTransaction[];
      selectedUser: ManagedUser | null;
      isLoading: boolean;
      error: string | null;
      totalCommission: number;
      totalBetsPlaced: number;
      totalStake: number;
}

const initialState: AgentState = {
      managedUsers: [],
      managedAgents: [],
      agentBets: [],
      commissionTransactions: [],
      selectedUser: null,
      isLoading: false,
      error: null,
      totalCommission: 0,
      totalBetsPlaced: 0,
      totalStake: 0,
};

export const agentSlice = createSlice({
      name: 'agent',
      initialState,
      reducers: {
            setLoading: (state, action: PayloadAction<boolean>) => {
                  state.isLoading = action.payload;
            },
            setError: (state, action: PayloadAction<string | null>) => {
                  state.error = action.payload;
            },
            setManagedUsers: (state, action: PayloadAction<ManagedUser[]>) => {
                  state.managedUsers = action.payload;
            },
            setManagedAgents: (state, action: PayloadAction<ManagedAgent[]>) => {
                  state.managedAgents = action.payload;
            },
            addManagedUser: (state, action: PayloadAction<ManagedUser>) => {
                  state.managedUsers.push(action.payload);
            },
            updateManagedUser: (state, action: PayloadAction<ManagedUser>) => {
                  const index = state.managedUsers.findIndex(user => user.id === action.payload.id);
                  if (index !== -1) {
                        state.managedUsers[index] = action.payload;
                  }
            },
            removeManagedUser: (state, action: PayloadAction<string>) => {
                  state.managedUsers = state.managedUsers.filter(user => user.id !== action.payload);
            },
            setSelectedUser: (state, action: PayloadAction<ManagedUser | null>) => {
                  state.selectedUser = action.payload;
            },
            setAgentBets: (state, action: PayloadAction<AgentBet[]>) => {
                  state.agentBets = action.payload;
            },
            addAgentBet: (state, action: PayloadAction<AgentBet>) => {
                  state.agentBets.push(action.payload);
                  state.totalBetsPlaced += 1;
                  state.totalStake += action.payload.totalStake;
            },
            updateAgentBet: (state, action: PayloadAction<AgentBet>) => {
                  const index = state.agentBets.findIndex(bet => bet.id === action.payload.id);
                  if (index !== -1) {
                        state.agentBets[index] = action.payload;
                  }
            },
            addCommissionTransaction: (state, action: PayloadAction<CommissionTransaction>) => {
                  state.commissionTransactions.push(action.payload);
                  state.totalCommission += action.payload.amount;
            },
            setAgentStats: (state, action: PayloadAction<{
                  totalCommission: number;
                  totalBetsPlaced: number;
                  totalStake: number;
            }>) => {
                  state.totalCommission = action.payload.totalCommission;
                  state.totalBetsPlaced = action.payload.totalBetsPlaced;
                  state.totalStake = action.payload.totalStake;
            },
            clearAgentData: (state) => {
                  state.managedUsers = [];
                  state.managedAgents = [];
                  state.agentBets = [];
                  state.commissionTransactions = [];
                  state.selectedUser = null;
                  state.totalCommission = 0;
                  state.totalBetsPlaced = 0;
                  state.totalStake = 0;
            },
      },
});

export const {
      setLoading,
      setError,
      setManagedUsers,
      setManagedAgents,
      addManagedUser,
      updateManagedUser,
      removeManagedUser,
      setSelectedUser,
      setAgentBets,
      addAgentBet,
      updateAgentBet,
      addCommissionTransaction,
      setAgentStats,
      clearAgentData,
} = agentSlice.actions;

export default agentSlice.reducer; 