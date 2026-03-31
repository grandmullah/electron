import { useState, useEffect, useCallback } from 'react';
import ShopAgentPerformanceService from '../services/shopAgentPerformanceService';
import type { 
  AgentPerformanceFilters, 
  AgentPerformanceSort 
} from '../types/shopAgents';

// Agent with performance metrics
interface ShopAgentWithPerf {
  id: string;
  phone_number: string;
  role: 'agent' | 'super_agent' | string;
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

export interface UseShopAgentPerformanceReturn {
  agents: ShopAgentWithPerf[];
  summary: {
    totalAgents: number;
    activeAgents: number;
    totalBalance: number;
    totalBets: number;
    totalStake: number;
    totalNetProfit: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  filters: AgentPerformanceFilters;
  setFilters: (filters: AgentPerformanceFilters) => void;
  sort: AgentPerformanceSort;
  setSort: (sort: AgentPerformanceSort) => void;
}

export const useShopAgentPerformance = (shopId: string | null): UseShopAgentPerformanceReturn => {
  const [agents, setAgents] = useState<ShopAgentWithPerf[]>([]);
  const [summary, setSummary] = useState<{
    totalAgents: number;
    activeAgents: number;
    totalBalance: number;
    totalBets: number;
    totalStake: number;
    totalNetProfit: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AgentPerformanceFilters>({});
  const [sort, setSort] = useState<AgentPerformanceSort>({ field: 'balance', direction: 'desc' });

  const fetchData = useCallback(async () => {
    if (!shopId) {
      setAgents([]);
      setSummary(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await ShopAgentPerformanceService.getShopAgentsWithPerformance(
        shopId,
        filters,
        sort
      );

      if (response.success) {
        setAgents(response.data.agents);
        setSummary(response.data.summary);
      } else {
        setError(response.message || 'Failed to fetch agents');
      }
    } catch (err: any) {
      console.error('Error fetching shop agents:', err);
      setError(err.message || 'Failed to fetch shop agents');
    } finally {
      setIsLoading(false);
    }
  }, [shopId, filters, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    agents,
    summary,
    isLoading,
    error,
    refresh,
    filters,
    setFilters,
    sort,
    setSort,
  };
};
