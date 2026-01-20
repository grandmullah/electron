import axios from 'axios';
import { API_BASE_URL, API_KEY } from './apiConfig';

interface League {
      key: string;
      title: string;
      isActive: boolean;
      region?: string;
      sport?: string;
}

interface LeagueManagementResponse {
      success: boolean;
      message: string;
      data: {
            leagues: League[];
            total: number;
            active: number;
            inactive: number;
      };
}

class LeagueManagementService {
      private static getAuthHeaders(): Record<string, string> {
            const token = localStorage.getItem('authToken');
            return {
                  'Content-Type': 'application/json',
                  'X-API-Key': API_KEY,
                  ...(token && { 'Authorization': `Bearer ${token}` }),
            };
      }

      /**
       * Get all leagues with their activation status
       */
      static async getAllLeagues(options?: { includeInactive?: boolean }): Promise<LeagueManagementResponse> {
            try {
                  const includeInactive = options?.includeInactive ?? true;

                  // Prefer the dedicated admin endpoint when available (local repo)
                  try {
                        const mgmt = await axios.get(`${API_BASE_URL}/leagues/management`, {
                              headers: this.getAuthHeaders(),
                        });
                        const payload = mgmt.data;
                        if (payload?.success && payload?.data?.leagues) {
                              const raw: any[] = Array.isArray(payload.data.leagues) ? payload.data.leagues : [];
                              const leagues: League[] = raw.map((row: any) => ({
                                    key: row.key || row.league_key,
                                    title: row.title || row.league_title,
                                    isActive: Boolean(row.isActive ?? row.is_active ?? false),
                                    region: row.region || row.country,
                                    sport: row.sport || row.sport_title,
                              }));

                              const active = leagues.filter(l => l.isActive).length;
                              const inactive = leagues.length - active;

                              return {
                                    success: true,
                                    message: payload?.message || 'Leagues loaded',
                                    data: {
                                          leagues,
                                          total: Number(payload?.data?.total ?? leagues.length),
                                          active: Number(payload?.data?.active ?? active),
                                          inactive: Number(payload?.data?.inactive ?? inactive),
                                    }
                              };
                        }
                  } catch (err: any) {
                        // If this endpoint doesn't exist on a deployment, fall back to /games/leagues.
                        if (err?.response?.status !== 404) {
                              throw err;
                        }
                  }

                  // Fallback: betzone-sports exposes leagues under /api/games/leagues
                  const response = await axios.get(
                        `${API_BASE_URL}/games/leagues${includeInactive ? '?includeInactive=true' : ''}`,
                        { headers: this.getAuthHeaders() }
                  );
                  const payload = response.data;

                  // Shape: { success, data: LeagueRow[], count }
                  const rows: any[] = Array.isArray(payload?.data) ? payload.data : [];
                  const leagues: League[] = rows.map((row: any) => ({
                        key: row.league_key || row.key,
                        title: row.league_title || row.title,
                        isActive: Boolean(row.is_active ?? row.isActive ?? true),
                        region: row.country || row.region,
                        sport: row.sport_title || row.sport,
                  }));

                  const active = leagues.filter(l => l.isActive).length;
                  const inactive = leagues.length - active;

                  return {
                        success: Boolean(payload?.success),
                        message: payload?.message || 'Leagues loaded',
                        data: { leagues, total: leagues.length, active, inactive }
                  };
            } catch (error: any) {
                  console.error('Failed to fetch leagues:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch leagues');
            }
      }

      /**
       * Get status for a specific league
       */
      static async getLeagueStatus(leagueKey: string): Promise<any> {
            try {
                  // Prefer management endpoint if present
                  try {
                        const response = await axios.get(`${API_BASE_URL}/leagues/management/${leagueKey}/status`, {
                              headers: this.getAuthHeaders(),
                        });
                        return response.data;
                  } catch (err: any) {
                        if (err?.response?.status !== 404) throw err;
                  }

                  // Fallback: derive from list
                  const all = await this.getAllLeagues({ includeInactive: true });
                  const league = all.data.leagues.find(l => l.key === leagueKey);
                  if (!league) throw new Error('League not found');
                  return { success: true, data: league };
            } catch (error: any) {
                  console.error(`Failed to fetch status for ${leagueKey}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to fetch league status');
            }
      }

      /**
       * Activate a specific league
       */
      static async activateLeague(leagueKey: string): Promise<{ success: boolean; message: string }> {
            try {
                  // Prefer management endpoint if present
                  try {
                        const response = await axios.post(`${API_BASE_URL}/leagues/management/${leagueKey}/activate`, {}, {
                              headers: this.getAuthHeaders(),
                        });
                        return response.data;
                  } catch (err: any) {
                        if (err?.response?.status !== 404) throw err;
                  }

                  const response = await axios.post(`${API_BASE_URL}/games/leagues/${leagueKey}/enable`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error(`Failed to activate league ${leagueKey}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to activate league');
            }
      }

      /**
       * Deactivate a specific league
       */
      static async deactivateLeague(leagueKey: string): Promise<{ success: boolean; message: string }> {
            try {
                  // Prefer management endpoint if present
                  try {
                        const response = await axios.post(`${API_BASE_URL}/leagues/management/${leagueKey}/deactivate`, {}, {
                              headers: this.getAuthHeaders(),
                        });
                        return response.data;
                  } catch (err: any) {
                        if (err?.response?.status !== 404) throw err;
                  }

                  const response = await axios.post(`${API_BASE_URL}/games/leagues/${leagueKey}/disable`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (error: any) {
                  console.error(`Failed to deactivate league ${leagueKey}:`, error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to deactivate league');
            }
      }

      /**
       * Activate multiple leagues at once
       */
      static async activateMultiple(leagueKeys: string[]): Promise<any> {
            try {
                  const results = await Promise.allSettled(
                        leagueKeys.map((k) => this.activateLeague(k))
                  );
                  const activated = results
                        .map((r, idx) => ({ r, key: leagueKeys[idx] }))
                        .filter(x => x.r.status === 'fulfilled')
                        .map(x => x.key);
                  const failed = results
                        .map((r, idx) => ({ r, key: leagueKeys[idx] }))
                        .filter(x => x.r.status === 'rejected')
                        .map(x => x.key);
                  return { success: true, data: { activated, failed } };
            } catch (error: any) {
                  console.error('Failed to activate multiple leagues:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to activate multiple leagues');
            }
      }

      /**
       * Deactivate all leagues except specified ones
       */
      static async deactivateAllExcept(keepActive: string[]): Promise<any> {
            try {
                  const all = await this.getAllLeagues();
                  const toDisable = all.data.leagues
                        .map(l => l.key)
                        .filter(k => !keepActive.includes(k));
                  const results = await Promise.allSettled(toDisable.map(k => this.deactivateLeague(k)));
                  const disabled = results
                        .map((r, idx) => ({ r, key: toDisable[idx] }))
                        .filter(x => x.r.status === 'fulfilled')
                        .map(x => x.key);
                  return { success: true, data: { disabled } };
            } catch (error: any) {
                  console.error('Failed to deactivate leagues:', error);
                  throw new Error(error.response?.data?.message || error.message || 'Failed to deactivate leagues');
            }
      }

      /**
       * Sync leagues with external API
       */
      static async syncLeagues(): Promise<any> {
            try {
                  const response = await axios.post(`${API_BASE_URL}/leagues/management/sync`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (err: any) {
                  if (err?.response?.status === 404) {
                        return { success: true, message: 'Sync not supported by backend; refresh leagues instead.' };
                  }
                  throw err;
            }
      }

      /**
       * Initialize leagues from external API
       */
      static async initializeLeagues(): Promise<any> {
            try {
                  const response = await axios.post(`${API_BASE_URL}/leagues/management/initialize`, {}, {
                        headers: this.getAuthHeaders(),
                  });
                  return response.data;
            } catch (err: any) {
                  if (err?.response?.status === 404) {
                        return { success: true, message: 'Initialize not supported by backend; refresh leagues instead.' };
                  }
                  throw err;
            }
      }
}

export default LeagueManagementService;


