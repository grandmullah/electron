import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export interface Game {
      id: string;
      homeTeam: string;
      awayTeam: string;
      homeOdds: number | string | null;
      drawOdds: number | string | null;
      awayOdds: number | string | null;
      matchTime: string;
      league: string;
      sportKey: string;
      status: 'upcoming' | 'live' | 'finished';
      doubleChance: {
            homeOrDraw: number | string | null;
            homeOrAway: number | string | null;
            drawOrAway: number | string | null;
      };
      overUnder: {
            over25: number | string | null;
            under25: number | string | null;
      };
      totals: Array<{
            point: number;
            over: number | string | null;
            under: number | string | null;
      }>;
      bothTeamsToScore: {
            yes: number | string | null;
            no: number | string | null;
      };
      spreads: {
            homeSpread: number | string | null;
            awaySpread: number | string | null;
            homeSpreadOdds: number | string | null;
            awaySpreadOdds: number | string | null;
            spreadLine: number | string | null;
      };
      hasValidOdds: boolean;
}

class GamesService {
      static async fetchOdds(leagueKey: string): Promise<Game[]> {
            try {
                  // Use the correct API endpoint format: /api/leagues/{league_key}/odds
                  const path = `/leagues/${leagueKey}/odds`;

                  // Make the API call
                  const response = await axios.get(`${API_BASE_URL}${path}`);

                  const games: Game[] = (response.data?.data || [])
                        .map((game: any) => {
                              const bookmakers = Array.isArray(game.bookmakers) ? game.bookmakers : [];

                              // Handle games without bookmaker data (like Bundesliga/La Liga)
                              if (bookmakers.length === 0) {
                                    return {
                                          id: game.id,
                                          homeTeam: game.home_team,
                                          awayTeam: game.away_team,
                                          homeOdds: null,
                                          drawOdds: null,
                                          awayOdds: null,
                                          matchTime: game.commence_time,
                                          league: game.sport_title || 'Unknown',
                                          sportKey: game.sport_key,
                                          status: game.status === 'scheduled' ? 'upcoming' : game.status,
                                          doubleChance: {
                                                homeOrDraw: null,
                                                homeOrAway: null,
                                                drawOrAway: null,
                                          },
                                          overUnder: {
                                                over25: null,
                                                under25: null,
                                          },
                                          totals: [],
                                          bothTeamsToScore: {
                                                yes: null,
                                                no: null,
                                          },
                                          spreads: {
                                                homeSpread: null,
                                                awaySpread: null,
                                                homeSpreadOdds: null,
                                                awaySpreadOdds: null,
                                                spreadLine: null,
                                          },
                                          hasValidOdds: false,
                                    };
                              }

                              // Prefer the first bookmaker that has the market we need
                              const findMarketFromAnyBookmaker = (marketKey: string) => {
                                    for (const bm of bookmakers) {
                                          const market = bm?.markets?.find((m: any) => m.key === marketKey);
                                          if (market) return market;
                                    }
                                    return null;
                              };

                              // H2H odds - Don't exclude games if H2H market is missing
                              const h2hMarket = findMarketFromAnyBookmaker('h2h');

                              const homeOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === game.home_team);
                              const awayOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === game.away_team);
                              const drawOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === 'Draw');

                              // Double Chance
                              const dcMarket = findMarketFromAnyBookmaker('double_chance');
                              const findDoubleChanceOutcomeOdds = (variant: 'home_draw' | 'home_away' | 'draw_away') => {
                                    if (!dcMarket?.outcomes) return null;
                                    const homeTeam: string = game.home_team;
                                    const awayTeam: string = game.away_team;

                                    const candidates: string[] = (() => {
                                          switch (variant) {
                                                case 'home_draw':
                                                      return [
                                                            `${homeTeam} or Draw`,
                                                            `Draw or ${homeTeam}`,
                                                            'Home or Draw',
                                                            'Draw or Home',
                                                            '1X',
                                                            'X1',
                                                            'Home/Draw',
                                                            'Draw/Home'
                                                      ];
                                                case 'home_away':
                                                      return [
                                                            `${homeTeam} or ${awayTeam}`,
                                                            `${awayTeam} or ${homeTeam}`,
                                                            'Home or Away',
                                                            'Away or Home',
                                                            '12',
                                                            '21',
                                                            'Home/Away',
                                                            'Away/Home'
                                                      ];
                                                case 'draw_away':
                                                      return [
                                                            `Draw or ${awayTeam}`,
                                                            `${awayTeam} or Draw`,
                                                            'Draw or Away',
                                                            'Away or Draw',
                                                            'X2',
                                                            '2X',
                                                            'Draw/Away',
                                                            'Away/Draw'
                                                      ];
                                          }
                                    })();

                                    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
                                    const outcome = dcMarket.outcomes.find((o: any) =>
                                          candidates.some(p => normalize(String(o.name || '')) === normalize(p))
                                    );
                                    if (outcome?.price) return outcome.price;

                                    const outcomeContains = dcMarket.outcomes.find((o: any) =>
                                          candidates.some(p => normalize(String(o.name || '')).includes(normalize(p)))
                                    );
                                    return outcomeContains?.price ?? null;
                              };

                              // Totals (Over/Under) - Extract all available point values
                              const totalsMarket = findMarketFromAnyBookmaker('totals');
                              const findTotalsOutcomeOdds = (isOver: boolean, targetPoint: number) => {
                                    if (!totalsMarket?.outcomes) return null;
                                    const outcomes = totalsMarket.outcomes;
                                    // Prefer exact point match using numeric point field
                                    const byPoint = outcomes.find((o: any) => {
                                          const name = String(o.name || '').toLowerCase();
                                          const matches = isOver ? name.includes('over') : name.includes('under');
                                          const hasPoint = typeof o.point === 'number' && Math.abs((o.point as number) - targetPoint) < 1e-6;
                                          return matches && hasPoint;
                                    });
                                    if (byPoint?.price) return byPoint.price;
                                    // Fallback: name contains the point
                                    const targetText = `${isOver ? 'over' : 'under'} ${targetPoint}`;
                                    const byName = outcomes.find((o: any) => String(o.name || '').toLowerCase().includes(targetText));
                                    if (byName?.price) return byName.price;
                                    // Last resort: first Over/Under
                                    const generic = outcomes.find((o: any) => String(o.name || '').toLowerCase().includes(isOver ? 'over' : 'under'));
                                    return generic?.price ?? null;
                              };

                              // Extract only existing totals with actual odds
                              const extractExistingTotals = () => {
                                    if (!totalsMarket?.outcomes) return [];

                                    const totalsData: Array<{ point: number, over: number | null, under: number | null }> = [];

                                    // Get unique point values from the actual outcomes
                                    const uniquePoints = [...new Set(totalsMarket.outcomes.map((outcome: any) => outcome.point))];

                                    // Only show points that have actual odds data
                                    uniquePoints.forEach(point => {
                                          const numericPoint = typeof point === 'number' ? point : parseFloat(String(point));
                                          if (!isNaN(numericPoint)) {
                                                const overOdds = findTotalsOutcomeOdds(true, numericPoint);
                                                const underOdds = findTotalsOutcomeOdds(false, numericPoint);

                                                // Only include if at least one odds value exists
                                                if (overOdds !== null || underOdds !== null) {
                                                      totalsData.push({
                                                            point: numericPoint,
                                                            over: overOdds,
                                                            under: underOdds
                                                      });
                                                }
                                          }
                                    });

                                    return totalsData;
                              };

                              // BTTS
                              const bttsMarket = findMarketFromAnyBookmaker('btts');
                              const bttsYes = bttsMarket?.outcomes?.find((o: any) => String(o.name || '').toLowerCase() === 'yes');
                              const bttsNo = bttsMarket?.outcomes?.find((o: any) => String(o.name || '').toLowerCase() === 'no');

                              // Spreads
                              const spreadsMarket = findMarketFromAnyBookmaker('spreads');
                              const findSpreadOutcomeOdds = (isHome: boolean) => {
                                    if (!spreadsMarket?.outcomes) return null;
                                    const outcomes = spreadsMarket.outcomes;
                                    const homeTeam = game.home_team;
                                    const awayTeam = game.away_team;

                                    const outcome = outcomes.find((o: any) => {
                                          const name = String(o.name || '').toLowerCase();
                                          const teamName = isHome ? homeTeam.toLowerCase() : awayTeam.toLowerCase();
                                          return name.includes(teamName);
                                    });
                                    return outcome?.price ?? null;
                              };

                              // DEBUG: Log details for Tottenham vs Bournemouth
                              if (game.home_team?.toLowerCase().includes('tottenham') || game.away_team?.toLowerCase().includes('tottenham')) {
                                    console.log('=== TOTTENHAM GAME DEBUG ===');
                                    console.log('Game:', game.home_team, 'vs', game.away_team);
                                    console.log('Total bookmakers:', bookmakers.length);
                                    console.log('Available markets:', bookmakers.map((bm: any) => bm?.markets?.map((m: any) => m.key)).flat());
                                    console.log('Double Chance market found:', dcMarket ? 'YES' : 'NO');
                                    console.log('BTTS market found:', bttsMarket ? 'YES' : 'NO');
                                    if (dcMarket) {
                                          console.log('Double Chance outcomes:', dcMarket.outcomes?.map((o: any) => ({ name: o.name, odds: o.price })));
                                    }
                                    if (bttsMarket) {
                                          console.log('BTTS outcomes:', bttsMarket.outcomes?.map((o: any) => ({ name: o.name, odds: o.price })));
                                    }
                              }

                              // Check if any betting options are available (not just 3-way odds)
                              const hasValidOdds = Boolean(
                                    // Basic 3-way odds
                                    (homeOutcome?.price && awayOutcome?.price && drawOutcome?.price) ||
                                    // Double chance odds
                                    (findDoubleChanceOutcomeOdds('home_draw') || findDoubleChanceOutcomeOdds('home_away') || findDoubleChanceOutcomeOdds('draw_away')) ||
                                    // Totals odds
                                    (extractExistingTotals().length > 0) ||
                                    // BTTS odds
                                    (bttsYes?.price || bttsNo?.price) ||
                                    // Spreads odds
                                    (findSpreadOutcomeOdds(true) || findSpreadOutcomeOdds(false))
                              );

                              const transformed: Game = {
                                    id: game.id,
                                    homeTeam: game.home_team,
                                    awayTeam: game.away_team,
                                    homeOdds: homeOutcome?.price ?? null,
                                    drawOdds: drawOutcome?.price ?? null,
                                    awayOdds: awayOutcome?.price ?? null,
                                    matchTime: game.commence_time,
                                    league: game.sport_title,
                                    sportKey: game.sport_key || 'soccer_epl',
                                    status: 'upcoming',
                                    doubleChance: {
                                          homeOrDraw: findDoubleChanceOutcomeOdds('home_draw'),
                                          homeOrAway: findDoubleChanceOutcomeOdds('home_away'),
                                          drawOrAway: findDoubleChanceOutcomeOdds('draw_away'),
                                    },
                                    overUnder: {
                                          over25: findTotalsOutcomeOdds(true, 2.5),
                                          under25: findTotalsOutcomeOdds(false, 2.5),
                                    },
                                    totals: extractExistingTotals(),
                                    bothTeamsToScore: {
                                          yes: bttsYes?.price ?? null,
                                          no: bttsNo?.price ?? null,
                                    },
                                    spreads: {
                                          homeSpread: null,
                                          awaySpread: null,
                                          homeSpreadOdds: findSpreadOutcomeOdds(true),
                                          awaySpreadOdds: findSpreadOutcomeOdds(false),
                                          spreadLine: spreadsMarket?.outcomes?.[0]?.point ?? null,
                                    },
                                    hasValidOdds,
                              };

                              return transformed;
                        })
                        .filter((game: Game | null) => game !== null && game !== undefined);

                  return games;
            } catch (error: any) {
                  // If specific endpoints are not available, provide helpful messages
                  if (leagueKey === 'soccer_uefa_world_cup_qualifiers') {
                        console.log('UEFA World Cup Qualifiers endpoint not available yet');
                        console.log('Expected endpoint: /api/uefa-world-cup-qualifiers/odds');
                        console.log('Please ensure the backend server implements this endpoint');
                        return [];
                  }

                  if (leagueKey === 'soccer_bundesliga') {
                        console.log('Bundesliga endpoint not available yet');
                        console.log('Expected endpoint: /api/bundesliga/odds');
                        console.log('Please ensure the backend server implements this endpoint');
                        return [];
                  }

                  if (leagueKey === 'soccer_laliga') {
                        console.log('La Liga endpoint not available yet');
                        console.log('Expected endpoint: /api/laliga/odds');
                        console.log('Please ensure the backend server implements this endpoint');
                        return [];
                  }

                  // Basic error normalization for other leagues
                  const message = error?.response?.data?.message || error.message || 'Failed to load games';
                  throw new Error(message);
            }
      }

      static async fetchEplOdds(): Promise<Game[]> {
            return this.fetchOdds('soccer_epl');
      }

      static async fetchUefaWorldCupQualifiersOdds(): Promise<Game[]> {
            return this.fetchOdds('soccer_uefa_world_cup_qualifiers');
      }

      static async fetchBundesligaOdds(): Promise<Game[]> {
            return this.fetchOdds('soccer_bundesliga');
      }

      static async fetchLaligaOdds(): Promise<Game[]> {
            return this.fetchOdds('soccer_laliga');
      }
}

export default GamesService;


