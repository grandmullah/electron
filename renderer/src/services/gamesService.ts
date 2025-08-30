import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export interface Game {
      id: string;
      homeTeam: string;
      awayTeam: string;
      homeOdds: number | null;
      drawOdds: number | null;
      awayOdds: number | null;
      matchTime: string;
      league: string;
      sportKey: string;
      status: 'upcoming' | 'live' | 'finished';
      doubleChance: {
            homeOrDraw: number | null;
            homeOrAway: number | null;
            drawOrAway: number | null;
      };
      overUnder: {
            over25: number | null;
            under25: number | null;
      };
      bothTeamsToScore: {
            yes: number | null;
            no: number | null;
      };
      spreads: {
            homeSpread: number | null;
            awaySpread: number | null;
            homeSpreadOdds: number | null;
            awaySpreadOdds: number | null;
            spreadLine: number | null;
      };
      hasValidOdds: boolean;
}

class GamesService {
      static async fetchOdds(leagueKey: string = 'soccer_epl'): Promise<Game[]> {
            try {
                  // Map known league keys to backend endpoints
                  const leaguePathMap: Record<string, string> = {
                        soccer_epl: '/epl/odds',
                  };

                  const path = leaguePathMap[leagueKey] || `/epl/odds`; // default to EPL if unknown for now
                  const response = await axios.get(`${API_BASE_URL}${path}`);

                  const games: Game[] = (response.data?.data || [])
                        .map((game: any) => {
                              const bookmakers = Array.isArray(game.bookmakers) ? game.bookmakers : [];
                              if (bookmakers.length === 0) return null;

                              // Prefer the first bookmaker that has the market we need
                              const findMarketFromAnyBookmaker = (marketKey: string) => {
                                    for (const bm of bookmakers) {
                                          const market = bm?.markets?.find((m: any) => m.key === marketKey);
                                          if (market) return market;
                                    }
                                    return null;
                              };

                              // H2H odds
                              const h2hMarket = findMarketFromAnyBookmaker('h2h');
                              if (!h2hMarket) return null;

                              const homeOutcome = h2hMarket.outcomes?.find((o: any) => o.name === game.home_team);
                              const awayOutcome = h2hMarket.outcomes?.find((o: any) => o.name === game.away_team);
                              const drawOutcome = h2hMarket.outcomes?.find((o: any) => o.name === 'Draw');

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
                                    if (outcome?.decimalOdds) return outcome.decimalOdds;

                                    const outcomeContains = dcMarket.outcomes.find((o: any) =>
                                          candidates.some(p => normalize(String(o.name || '')).includes(normalize(p)))
                                    );
                                    return outcomeContains?.decimalOdds ?? null;
                              };

                              // Totals (Over/Under 2.5)
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
                                    if (byPoint?.decimalOdds) return byPoint.decimalOdds;
                                    // Fallback: name contains the point
                                    const targetText = `${isOver ? 'over' : 'under'} ${targetPoint}`;
                                    const byName = outcomes.find((o: any) => String(o.name || '').toLowerCase().includes(targetText));
                                    if (byName?.decimalOdds) return byName.decimalOdds;
                                    // Last resort: first Over/Under
                                    const generic = outcomes.find((o: any) => String(o.name || '').toLowerCase().includes(isOver ? 'over' : 'under'));
                                    return generic?.decimalOdds ?? null;
                              };

                              // BTTS
                              const bttsMarket = findMarketFromAnyBookmaker('btts');
                              const bttsYes = bttsMarket?.outcomes?.find((o: any) => String(o.name || '').toLowerCase() === 'yes');
                              const bttsNo = bttsMarket?.outcomes?.find((o: any) => String(o.name || '').toLowerCase() === 'no');

                              // DEBUG: Log details for Tottenham vs Bournemouth
                              if (game.home_team?.toLowerCase().includes('tottenham') || game.away_team?.toLowerCase().includes('tottenham')) {
                                    console.log('=== TOTTENHAM GAME DEBUG ===');
                                    console.log('Game:', game.home_team, 'vs', game.away_team);
                                    console.log('Total bookmakers:', bookmakers.length);
                                    console.log('Available markets:', bookmakers.map((bm: any) => bm?.markets?.map((m: any) => m.key)).flat());
                                    console.log('Double Chance market found:', dcMarket ? 'YES' : 'NO');
                                    console.log('BTTS market found:', bttsMarket ? 'YES' : 'NO');
                                    if (dcMarket) {
                                          console.log('Double Chance outcomes:', dcMarket.outcomes?.map((o: any) => ({ name: o.name, odds: o.decimalOdds })));
                                    }
                                    if (bttsMarket) {
                                          console.log('BTTS outcomes:', bttsMarket.outcomes?.map((o: any) => ({ name: o.name, odds: o.decimalOdds })));
                                    }
                              }

                              const hasValidOdds = Boolean(
                                    homeOutcome?.decimalOdds &&
                                    awayOutcome?.decimalOdds &&
                                    drawOutcome?.decimalOdds
                              );

                              const transformed: Game = {
                                    id: game.id,
                                    homeTeam: game.home_team,
                                    awayTeam: game.away_team,
                                    homeOdds: homeOutcome?.decimalOdds ?? null,
                                    drawOdds: drawOutcome?.decimalOdds ?? null,
                                    awayOdds: awayOutcome?.decimalOdds ?? null,
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
                                    bothTeamsToScore: {
                                          yes: bttsYes?.decimalOdds ?? null,
                                          no: bttsNo?.decimalOdds ?? null,
                                    },
                                    spreads: {
                                          homeSpread: null,
                                          awaySpread: null,
                                          homeSpreadOdds: null,
                                          awaySpreadOdds: null,
                                          spreadLine: null,
                                    },
                                    hasValidOdds,
                              };

                              return transformed;
                        })
                        .filter(Boolean);

                  return games;
            } catch (error: any) {
                  // Basic error normalization
                  const message = error?.response?.data?.message || error.message || 'Failed to load games';
                  throw new Error(message);
            }
      }

      static async fetchEplOdds(): Promise<Game[]> {
            return this.fetchOdds('soccer_epl');
      }
}

export default GamesService;


