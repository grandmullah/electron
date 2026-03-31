import axios from 'axios';
import { API_BASE_URL, API_KEY } from './apiConfig';
import type { 
  ShopAgentsPerformanceResponse,
  AgentPerformanceFilters,
  AgentPerformanceSort 
} from '../types/shopAgents';
import type { ShopUser } from './shopManagementService';

// Internal type that matches our API response
interface ShopAgentWithPerf {
  id: string;
  phone_number: string;
  role: 'agent' | 'super_agent' | 'user' | 'admin';
  balance: number;
  is_active: boolean;
  created_at: string;
  shop_id?: string;
  shop_name?: string;
  performance: {
    totalBets: number;
    totalStake: number;
    totalWinnings: number;
    netProfit: number;
    winRate: number;
    pendingBets: number;
    settledBets: number;
    averageStake: number;
  };
  lastActive?: string;
}

export interface AgentBetSummary {
  agentId: string;
  totalBets: number;
  totalStake: number;
  totalWinnings: number;
  pendingBets: number;
  settledBets: number;
  wonBets: number;
  lostBets: number;
}

class ShopAgentPerformanceService {
  private static getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Get agents for a specific shop with their performance metrics
   * This combines data from multiple endpoints to provide a comprehensive view
   */
  static async getShopAgentsWithPerformance(
    shopId: string,
    filters?: AgentPerformanceFilters,
    sort?: AgentPerformanceSort
  ): Promise<ShopAgentsPerformanceResponse> {
    try {
      // Fetch shop agents
      const agents = await this.fetchShopAgents(shopId);
      
      // Fetch agent bets from agent endpoint
      const agentBets = await this.fetchAgentBetsForShop(shopId);
      
      // Calculate performance metrics for each agent
      const agentsWithPerformance: ShopAgentWithPerf[] = agents.map((agent: ShopUser) => {
        const bets = agentBets[agent.id] || [];
        const performance = this.calculatePerformanceMetrics(bets);
        
        return {
          ...agent,
          role: (agent.role as any) || 'agent',
          balance: Number(agent.balance ?? 0),
          is_active: Boolean(agent.is_active ?? true),
          created_at: agent.created_at || new Date().toISOString(),
          performance,
          lastActive: bets.length > 0 
            ? bets.sort((a: any, b: any) => 
                new Date(b.createdAt || b.created_at).getTime() - 
                new Date(a.createdAt || a.created_at).getTime()
              )[0]?.createdAt || agent.created_at
            : agent.created_at,
        };
      });

      // Apply filters
      let filteredAgents = agentsWithPerformance;
      if (filters) {
        filteredAgents = this.applyFilters(agentsWithPerformance, filters);
      }

      // Apply sorting
      if (sort) {
        filteredAgents = this.applySorting(filteredAgents, sort);
      }

      // Calculate summary
      const summary = {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.is_active).length,
        totalBalance: agents.reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
        totalBets: filteredAgents.reduce((sum, a) => sum + a.performance.totalBets, 0),
        totalStake: filteredAgents.reduce((sum, a) => sum + a.performance.totalStake, 0),
        totalNetProfit: filteredAgents.reduce((sum, a) => sum + a.performance.netProfit, 0),
      };

      return {
        success: true,
        data: {
          shopId,
          shopName: '', // Will be populated by caller if needed
          agents: filteredAgents as any,
          summary,
        },
      };
    } catch (error: any) {
      console.error('Failed to fetch shop agents with performance:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch shop agents');
    }
  }

  /**
   * Fetch agents for a specific shop (admin endpoint)
   */
  private static async fetchShopAgents(shopId: string): Promise<ShopUser[]> {
    const res = await axios.get<{ success: boolean; data: ShopUser[]; count?: number; error?: string }>(
      `${API_BASE_URL}/admin/users?shop_id=${encodeURIComponent(shopId)}&role=agent`,
      { headers: this.getAuthHeaders() }
    );
    
    if (!res.data?.success) {
      throw new Error((res.data as any)?.error || 'Failed to fetch shop agents');
    }

    // Also fetch super agents for this shop
    const superAgentsRes = await axios.get<{ success: boolean; data: ShopUser[]; count?: number; error?: string }>(
      `${API_BASE_URL}/admin/users?shop_id=${encodeURIComponent(shopId)}&role=super_agent`,
      { headers: this.getAuthHeaders() }
    );

    const agents = res.data.data || [];
    const superAgents = superAgentsRes.data?.success ? (superAgentsRes.data.data || []) : [];
    
    return [...agents, ...superAgents];
  }

  /**
   * Fetch bets for agents in a shop
   * This uses the agent endpoint which returns bets placed by agents
   */
  private static async fetchAgentBetsForShop(shopId: string): Promise<Record<string, any[]>> {
    const agentBetsMap: Record<string, any[]> = {};
    
    try {
      // For each agent, we'd need to fetch their bets
      // Since there's no bulk endpoint, we'll return an empty map
      // and the UI will show agent info without bet stats
      // In a production app, you'd want a backend endpoint for this
      
      // Alternative: Try to get shop bets which include agent info
      const res = await axios.get<{ success: boolean; data: any[]; count?: number }>(
        `${API_BASE_URL}/agent/shop/bets?limit=1000`,
        { headers: this.getAuthHeaders() }
      );

      if (res.data?.success && Array.isArray(res.data.data)) {
        // Group bets by agent
        res.data.data.forEach((bet: any) => {
          const agentId = bet.agent_id || bet.agentId;
          if (agentId) {
            if (!agentBetsMap[agentId]) {
              agentBetsMap[agentId] = [];
            }
            agentBetsMap[agentId].push(bet);
          }
        });
      }
    } catch (error) {
      console.warn('Could not fetch agent bets:', error);
    }

    return agentBetsMap;
  }

  /**
   * Calculate performance metrics from bets
   */
  private static calculatePerformanceMetrics(bets: any[]): {
    totalBets: number;
    totalStake: number;
    totalWinnings: number;
    netProfit: number;
    winRate: number;
    pendingBets: number;
    settledBets: number;
    averageStake: number;
  } {
    if (!bets || bets.length === 0) {
      return {
        totalBets: 0,
        totalStake: 0,
        totalWinnings: 0,
        netProfit: 0,
        winRate: 0,
        pendingBets: 0,
        settledBets: 0,
        averageStake: 0,
      };
    }

    const totalBets = bets.length;
    const totalStake = bets.reduce((sum, bet) => sum + (Number(bet.stake) || Number(bet.total_stake) || 0), 0);
    const pendingBets = bets.filter(bet => (bet.status || '').toLowerCase() === 'pending').length;
    const settledBets = bets.filter(bet => (bet.status || '').toLowerCase() === 'settled').length;
    const wonBets = bets.filter(bet => (bet.status || '').toLowerCase() === 'won').length;
    
    const totalWinnings = bets
      .filter(bet => (bet.status || '').toLowerCase() === 'won')
      .reduce((sum, bet) => sum + (Number(bet.potential_winnings) || Number(bet.potentialWinnings) || 0), 0);

    const netProfit = totalStake - totalWinnings; // From shop perspective: stake is income, winnings is payout
    const winRate = settledBets > 0 ? (wonBets / settledBets) * 100 : 0;
    const averageStake = totalBets > 0 ? totalStake / totalBets : 0;

    return {
      totalBets,
      totalStake,
      totalWinnings,
      netProfit,
      winRate,
      pendingBets,
      settledBets,
      averageStake,
    };
  }

  /**
   * Apply filters to agents
   */
  private static applyFilters(
    agents: ShopAgentWithPerf[], 
    filters: AgentPerformanceFilters
  ): ShopAgentWithPerf[] {
    return agents.filter(agent => {
      // Status filter
      if (filters.status === 'active' && !agent.is_active) return false;
      if (filters.status === 'inactive' && agent.is_active) return false;

      // Balance filters
      if (filters.minBalance !== undefined && agent.balance < filters.minBalance) return false;
      if (filters.maxBalance !== undefined && agent.balance > filters.maxBalance) return false;

      return true;
    });
  }

  /**
   * Apply sorting to agents
   */
  private static applySorting(
    agents: ShopAgentWithPerf[],
    sort: AgentPerformanceSort
  ): ShopAgentWithPerf[] {
    const sorted = [...agents];
    
    sorted.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sort.field) {
        case 'balance':
          aValue = a.balance;
          bValue = b.balance;
          break;
        case 'totalBets':
          aValue = a.performance.totalBets;
          bValue = b.performance.totalBets;
          break;
        case 'totalStake':
          aValue = a.performance.totalStake;
          bValue = b.performance.totalStake;
          break;
        case 'netProfit':
          aValue = a.performance.netProfit;
          bValue = b.performance.netProfit;
          break;
        case 'winRate':
          aValue = a.performance.winRate;
          bValue = b.performance.winRate;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }

  /**
   * Get detailed performance for a specific agent
   */
  static async getAgentDetailedPerformance(agentId: string, days: number = 30): Promise<{
    success: boolean;
    data: {
      dailyPerformance: Array<{
        date: string;
        bets: number;
        stake: number;
        winnings: number;
      }>;
      summary: {
        totalBets: number;
        totalStake: number;
        totalWinnings: number;
        netProfit: number;
      };
    };
  }> {
    try {
      // This would ideally come from a backend endpoint
      // For now, return mock data structure
      const dailyPerformance = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dailyPerformance.push({
          date: date.toISOString().split('T')[0],
          bets: 0,
          stake: 0,
          winnings: 0,
        });
      }

      return {
        success: true,
        data: {
          dailyPerformance: dailyPerformance.reverse(),
          summary: {
            totalBets: 0,
            totalStake: 0,
            totalWinnings: 0,
            netProfit: 0,
          },
        },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch agent detailed performance');
    }
  }
}

export default ShopAgentPerformanceService;
