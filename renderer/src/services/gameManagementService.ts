import axios from 'axios';
import { API_BASE_URL, API_KEY } from './apiConfig';

interface CronJobStatus {
      jobId: string;
      status: string;
      lastRun?: string;
      nextRun?: string;
}

interface LeagueSettings {
      isActive?: boolean;
      autoUpdateResults?: boolean;
      updateIntervalMinutes?: number;
}

interface PostponedMatch {
      id: number;
      external_id: string;
      home_team_name: string;
      away_team_name: string;
      commence_time: string;
      status: string;
      created_at: string;
      updated_at: string;
      sport_key: string;
      sport_title: string;
      league_key: string;
      league_title: string;
}

interface PostponedMatchFilters {
      sportKey?: string;
      leagueKey?: string;
      fromDate?: string;
      toDate?: string;
}

class GameManagementService {
      private static getAuthHeaders(): Record<string, string> {
            const token = localStorage.getItem('authToken');
            return {
                  'Content-Type': 'application/json',
                  'X-API-Key': API_KEY,
                  ...(token && { 'Authorization': `Bearer ${token}` }),
            };
      }

      // Cron Job Management
      static async getCronStatus(): Promise<any> {
            try {
                  const response = await axios.get(`${API_BASE_URL}/games/cron/status`, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error('Failed to fetch cron status:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch cron status');
            }
      }

      static async getCronStatistics(): Promise<any> {
            try {
                  const response = await axios.get(`${API_BASE_URL}/games/cron/statistics`, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error('Failed to fetch cron statistics:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch cron statistics');
            }
      }

      static async triggerCronJob(jobId: string): Promise<{ success: boolean; message: string }> {
            try {
                  const response = await axios.post(`${API_BASE_URL}/games/cron/jobs/${jobId}/trigger`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error(`Failed to trigger cron job ${jobId}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to trigger cron job');
            }
      }

      static async updateCronSchedule(jobId: string, schedule: string): Promise<{ success: boolean; message: string }> {
            try {
                  const response = await axios.put(`${API_BASE_URL}/games/cron/jobs/${jobId}/schedule`, {
                        schedule
                  }, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error(`Failed to update cron schedule ${jobId}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to update cron schedule');
            }
      }

      static async cleanupCronLogs(): Promise<{ success: boolean; message: string }> {
            try {
                  const response = await axios.post(`${API_BASE_URL}/games/cron/logs/cleanup`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error('Failed to cleanup cron logs:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to cleanup cron logs');
            }
      }

      // League Game Operations
      static async fetchLeagueGames(leagueKey: string): Promise<{ success: boolean; message: string }> {
            try {
                  const response = await axios.post(`${API_BASE_URL}/games/leagues/${leagueKey}/fetch-games`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error(`Failed to fetch games for ${leagueKey}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch league games');
            }
      }

      static async updateLeagueResults(leagueKey: string): Promise<{ success: boolean; message: string }> {
            try {
                  const response = await axios.post(`${API_BASE_URL}/games/leagues/${leagueKey}/update-results`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error(`Failed to update results for ${leagueKey}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to update league results');
            }
      }

      static async updateLeagueSettings(leagueKey: string, settings: LeagueSettings): Promise<any> {
            try {
                  const response = await axios.put(`${API_BASE_URL}/games/leagues/${leagueKey}/settings`, settings, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error(`Failed to update settings for ${leagueKey}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to update league settings');
            }
      }

      static async enableLeague(leagueKey: string): Promise<any> {
            try {
                  const response = await axios.post(`${API_BASE_URL}/games/leagues/${leagueKey}/enable`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error(`Failed to enable league ${leagueKey}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to enable league');
            }
      }

      static async disableLeague(leagueKey: string): Promise<any> {
            try {
                  const response = await axios.post(`${API_BASE_URL}/games/leagues/${leagueKey}/disable`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error(`Failed to disable league ${leagueKey}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to disable league');
            }
      }

      // Postponed Matches
      static async getPostponedMatches(filters?: PostponedMatchFilters): Promise<{ data: PostponedMatch[]; count: number }> {
            try {
                  const params = new URLSearchParams();
                  if (filters?.sportKey) params.append('sportKey', filters.sportKey);
                  if (filters?.leagueKey) params.append('leagueKey', filters.leagueKey);
                  if (filters?.fromDate) params.append('fromDate', filters.fromDate);
                  if (filters?.toDate) params.append('toDate', filters.toDate);

                  const queryString = params.toString();
                  const url = `${API_BASE_URL}/games/postponed${queryString ? `?${queryString}` : ''}`;

                  const response = await axios.get(url, {
                        headers: this.getAuthHeaders(),
                  });
                  return {
                        data: response.data.data || [],
                        count: response.data.count || 0
                  };
            } catch (error: any) {
                  console.error('Failed to fetch postponed matches:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch postponed matches');
            }
      }

      // Featured Games Management (Admin only)
      static async updateFeaturedGames(items: Array<{
            gameId: string;
            isFeatured: boolean;
            featuredRank?: number;
            featuredUntil?: string; // ISO timestamp
      }>): Promise<{ success: boolean; message?: string; data?: any }> {
            try {
                  // Local backend (`betzone-sports`) implements: PUT /api/games/featured
                  // Some remote deployments may use an admin-scoped prefix. Try both.
                  const tryPaths = [
                        `${API_BASE_URL}/games/featured`,
                        `${API_BASE_URL}/admin/games/featured`,
                  ];

                  let lastError: any = null;
                  for (const url of tryPaths) {
                        try {
                              const response = await axios.put(url, { items }, { headers: this.getAuthHeaders() });
                              return response.data;
                        } catch (err: any) {
                              lastError = err;
                              // If it's a 404 on this path, fall through and try the next.
                              const status = err?.response?.status;
                              if (status !== 404) {
                                    throw err;
                              }
                        }
                  }

                  throw lastError;
            } catch (error: any) {
                  console.error('Failed to update featured games:', error);
                  throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update featured games');
            }
      }
}

export default GameManagementService;


