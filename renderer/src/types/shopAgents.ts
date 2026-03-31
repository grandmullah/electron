// Types for shop agents and their performance metrics

export interface ShopAgent {
  id: string;
  phone_number: string;
  role: 'agent' | 'super_agent';
  balance: number;
  is_active: boolean;
  created_at: string;
  shop_id?: string;
  shop_name?: string;
}

export interface AgentPerformanceMetrics {
  totalBets: number;
  totalStake: number;
  totalWinnings: number;
  netProfit: number;
  winRate: number;
  pendingBets: number;
  settledBets: number;
  averageStake: number;
}

export interface ShopAgentWithPerformance extends ShopAgent {
  performance: AgentPerformanceMetrics;
  lastActive?: string;
}

export interface ShopAgentsPerformanceResponse {
  success: boolean;
  data: {
    shopId: string;
    shopName: string;
    agents: ShopAgentWithPerformance[];
    summary: {
      totalAgents: number;
      activeAgents: number;
      totalBalance: number;
      totalBets: number;
      totalStake: number;
      totalNetProfit: number;
    };
  };
  message?: string;
}

export interface AgentPerformanceFilters {
  startDate?: string;
  endDate?: string;
  status?: 'all' | 'active' | 'inactive';
  minBalance?: number;
  maxBalance?: number;
}

export interface AgentPerformanceSort {
  field: 'balance' | 'totalBets' | 'totalStake' | 'netProfit' | 'winRate' | 'created_at';
  direction: 'asc' | 'desc';
}
