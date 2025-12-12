/**
 * Odds Parser Utility
 * Reusable functions for parsing odds from various data structures
 */

import { GameOdds } from '../types/games';

/**
 * Generic outcome structure that works with both API formats
 */
interface GenericOutcome {
      name: string;
      price: number;
      point?: number | null;
      description?: string; // Team name for team totals
}

/**
 * Normalize outcome from different formats to GenericOutcome
 */
export function normalizeOutcome(outcome: any): GenericOutcome {
      return {
            name: outcome.name || outcome.outcome_name || '',
            price: outcome.price || outcome.outcome_price || 0,
            point: outcome.point ?? outcome.outcome_point ?? null,
            description: outcome.description, // For team totals
      };
}

/**
 * Find market from bookmakers array (legacy format)
 */
export function findMarketFromBookmakers(bookmakers: any[], marketKey: string): any {
      for (const bm of bookmakers) {
            const market = bm?.markets?.find((m: any) => m.key === marketKey);
            if (market) return market;
      }
      return null;
}

/**
 * Find H2H odds (Home/Draw/Away)
 */
export function extractH2HOdds(
      outcomes: any[],
      homeTeam: string,
      awayTeam: string
): {
      homeOdds: number | null;
      drawOdds: number | null;
      awayOdds: number | null;
} {
      if (!outcomes || outcomes.length === 0) {
            return { homeOdds: null, drawOdds: null, awayOdds: null };
      }

      const normalized = outcomes.map(normalizeOutcome);

      const homeOutcome = normalized.find(o => o.name === homeTeam);
      const awayOutcome = normalized.find(o => o.name === awayTeam);
      const drawOutcome = normalized.find(o => o.name.toLowerCase() === 'draw');

      return {
            homeOdds: homeOutcome?.price ?? null,
            drawOdds: drawOutcome?.price ?? null,
            awayOdds: awayOutcome?.price ?? null,
      };
}

/**
 * Find double chance odds
 */
export function extractDoubleChanceOdds(
      outcomes: any[],
      homeTeam: string,
      awayTeam: string
): {
      homeOrDraw: number | null;
      homeOrAway: number | null;
      drawOrAway: number | null;
} {
      if (!outcomes || outcomes.length === 0) {
            return { homeOrDraw: null, homeOrAway: null, drawOrAway: null };
      }

      const normalized = outcomes.map(normalizeOutcome);
      const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

      const findOdds = (variant: 'home_draw' | 'home_away' | 'draw_away'): number | null => {
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

            const outcome = normalized.find(o =>
                  candidates.some(p => normalize(o.name) === normalize(p))
            );
            return outcome?.price ?? null;
      };

      return {
            homeOrDraw: findOdds('home_draw'),
            homeOrAway: findOdds('home_away'),
            drawOrAway: findOdds('draw_away'),
      };
}

/**
 * Extract totals/over-under odds
 */
export function extractTotalsOdds(
      outcomes: any[]
): Array<{ point: number; over: number | null; under: number | null }> {
      if (!outcomes || outcomes.length === 0) return [];

      const normalized = outcomes.map(normalizeOutcome);
      const totalsMap = new Map<number, { over: number | null; under: number | null }>();

      normalized.forEach(outcome => {
            const point = outcome.point;
            if (point === null || typeof point !== 'number') return;

            if (!totalsMap.has(point)) {
                  totalsMap.set(point, { over: null, under: null });
            }

            const entry = totalsMap.get(point)!;
            const name = outcome.name.toLowerCase();

            if (name.includes('over')) {
                  entry.over = outcome.price;
            } else if (name.includes('under')) {
                  entry.under = outcome.price;
            }
      });

      return Array.from(totalsMap.entries())
            .map(([point, data]) => ({ point, over: data.over, under: data.under }))
            .filter(t => t.over !== null || t.under !== null)
            .sort((a, b) => a.point - b.point);
}

/**
 * Extract BTTS (Both Teams To Score) odds
 */
export function extractBTTSOdds(
      outcomes: any[]
): {
      yes: number | null;
      no: number | null;
} {
      if (!outcomes || outcomes.length === 0) {
            return { yes: null, no: null };
      }

      const normalized = outcomes.map(normalizeOutcome);

      const yesOutcome = normalized.find(o => o.name.toLowerCase() === 'yes');
      const noOutcome = normalized.find(o => o.name.toLowerCase() === 'no');

      return {
            yes: yesOutcome?.price ?? null,
            no: noOutcome?.price ?? null,
      };
}

/**
 * Extract spread odds
 */
export function extractSpreadOdds(
      outcomes: any[],
      homeTeam: string,
      awayTeam: string
): {
      homeSpread: number | null;
      awaySpread: number | null;
      homeSpreadOdds: number | null;
      awaySpreadOdds: number | null;
      spreadLine: number | null;
} {
      if (!outcomes || outcomes.length === 0) {
            return {
                  homeSpread: null,
                  awaySpread: null,
                  homeSpreadOdds: null,
                  awaySpreadOdds: null,
                  spreadLine: null,
            };
      }

      const normalized = outcomes.map(normalizeOutcome);

      const homeOutcome = normalized.find(o =>
            o.name.toLowerCase().includes(homeTeam.toLowerCase())
      );
      const awayOutcome = normalized.find(o =>
            o.name.toLowerCase().includes(awayTeam.toLowerCase())
      );

      return {
            homeSpread: homeOutcome?.point ?? null,
            awaySpread: awayOutcome?.point ?? null,
            homeSpreadOdds: homeOutcome?.price ?? null,
            awaySpreadOdds: awayOutcome?.price ?? null,
            spreadLine: homeOutcome?.point ?? null,
      };
}

/**
 * Check if odds are valid (at least one betting option available)
 */
export function hasValidOdds(oddsData: {
      homeOdds: number | null;
      drawOdds: number | null;
      awayOdds: number | null;
      doubleChance: {
            homeOrDraw: number | null;
            homeOrAway: number | null;
            drawOrAway: number | null;
      };
      totals: Array<{ point: number; over: number | null; under: number | null }>;
      bothTeamsToScore: {
            yes: number | null;
            no: number | null;
      };
      spreads: {
            homeSpreadOdds: number | null;
            awaySpreadOdds: number | null;
      };
}): boolean {
      return Boolean(
            // Basic 3-way odds
            (oddsData.homeOdds && oddsData.drawOdds && oddsData.awayOdds) ||
            // Double chance odds
            (oddsData.doubleChance.homeOrDraw || oddsData.doubleChance.homeOrAway || oddsData.doubleChance.drawOrAway) ||
            // Totals odds
            (oddsData.totals.length > 0) ||
            // BTTS odds
            (oddsData.bothTeamsToScore.yes || oddsData.bothTeamsToScore.no) ||
            // Spreads odds
            (oddsData.spreads.homeSpreadOdds || oddsData.spreads.awaySpreadOdds)
      );
}

/**
 * Extract team totals (by team)
 */
export function extractTeamTotalsOdds(
      outcomes: any[],
      homeTeam: string,
      awayTeam: string
): Array<{ team: string; point: number; over: number | null; under: number | null }> {
      if (!outcomes || outcomes.length === 0) return [];

      const normalized = outcomes.map(normalizeOutcome);
      const teamTotalsMap = new Map<string, Map<number, { over: number | null; under: number | null }>>();

      normalized.forEach(outcome => {
            const point = outcome.point;
            if (point === null || typeof point !== 'number') return;

            const name = outcome.name.toLowerCase();
            const description = (outcome.description || '').toLowerCase();
            let team = '';

            // Check description field first (new API format)
            if (description) {
                  const homeLower = homeTeam.toLowerCase().trim();
                  const awayLower = awayTeam.toLowerCase().trim();
                  const descLower = description.toLowerCase().trim();
                  
                  // More flexible matching - check exact match first, then contains
                  // Also handle partial matches (e.g., "Arsenal" matches "Arsenal FC")
                  if (descLower === homeLower || 
                      descLower.includes(homeLower) || 
                      homeLower.includes(descLower) ||
                      descLower === 'home') {
                        team = 'home';
                  } else if (descLower === awayLower || 
                            descLower.includes(awayLower) || 
                            awayLower.includes(descLower) ||
                            descLower === 'away') {
                        team = 'away';
                  }
            }

            // Fallback to parsing name field (legacy format)
            if (!team) {
                  const homeLower = homeTeam.toLowerCase().trim();
                  const awayLower = awayTeam.toLowerCase().trim();
                  
                  // Check if name contains team name (e.g., "Arsenal Over" contains "Arsenal")
                  if (name.includes(homeLower) || name.includes('home')) {
                        team = 'home';
                  } else if (name.includes(awayLower) || name.includes('away')) {
                        team = 'away';
                  } else {
                        // Debug: log unmatched outcomes
                        console.warn('⚠️ Team totals: Could not match team', { 
                              name, 
                              description, 
                              homeTeam, 
                              awayTeam,
                              nameLower: name,
                              homeLower,
                              awayLower
                        });
                        return; // Skip if can't determine team
                  }
            }

            if (!teamTotalsMap.has(team)) {
                  teamTotalsMap.set(team, new Map());
            }

            const teamMap = teamTotalsMap.get(team)!;
            if (!teamMap.has(point)) {
                  teamMap.set(point, { over: null, under: null });
            }

            const entry = teamMap.get(point)!;
            if (name.includes('over')) {
                  entry.over = outcome.price;
            } else if (name.includes('under')) {
                  entry.under = outcome.price;
            }
      });

      const result: Array<{ team: string; point: number; over: number | null; under: number | null }> = [];

      teamTotalsMap.forEach((pointsMap, team) => {
            pointsMap.forEach((data, point) => {
                  if (data.over !== null || data.under !== null) {
                        result.push({ team, point, over: data.over, under: data.under });
                  }
            });
      });

      return result.sort((a, b) => {
            if (a.team === b.team) return a.point - b.point;
            return a.team === 'home' ? -1 : 1;
      });
}

/**
 * Parse all odds from GameOdds array (new backend format)
 */
export function parseOddsFromGameOddsArray(
      odds: GameOdds[],
      homeTeam: string,
      awayTeam: string
) {
      // Group odds by market (including half-time markets)
      const h2hOdds = odds.filter(o => o.market_key === 'h2h');
      const dcOdds = odds.filter(o => o.market_key === 'double_chance');
      const totalsOdds = odds.filter(o => o.market_key === 'totals');
      const bttsOdds = odds.filter(o => o.market_key === 'btts');
      const spreadsOdds = odds.filter(o => o.market_key === 'spreads');
      const teamTotalsOdds = odds.filter(o => o.market_key === 'team_totals'); // Full-time team totals

      // Half-time markets
      const h2h_h1_Odds = odds.filter(o => o.market_key === 'h2h_h1');
      const h2h_h2_Odds = odds.filter(o => o.market_key === 'h2h_h2');
      const totals_h1_Odds = odds.filter(o => o.market_key === 'totals_h1');
      const totals_h2_Odds = odds.filter(o => o.market_key === 'totals_h2');
      const team_totals_h1_Odds = odds.filter(o => o.market_key === 'team_totals_h1');
      const team_totals_h2_Odds = odds.filter(o => o.market_key === 'team_totals_h2');

      const h2h = extractH2HOdds(h2hOdds, homeTeam, awayTeam);
      const doubleChance = extractDoubleChanceOdds(dcOdds, homeTeam, awayTeam);
      const totals = extractTotalsOdds(totalsOdds);
      const bothTeamsToScore = extractBTTSOdds(bttsOdds);
      const spreads = extractSpreadOdds(spreadsOdds, homeTeam, awayTeam);
      const teamTotals = extractTeamTotalsOdds(teamTotalsOdds, homeTeam, awayTeam); // Full-time team totals

      // Parse half-time markets
      const h2h_h1 = extractH2HOdds(h2h_h1_Odds, homeTeam, awayTeam);
      const h2h_h2 = extractH2HOdds(h2h_h2_Odds, homeTeam, awayTeam);
      const totals_h1 = extractTotalsOdds(totals_h1_Odds);
      const totals_h2 = extractTotalsOdds(totals_h2_Odds);
      const team_totals_h1 = extractTeamTotalsOdds(team_totals_h1_Odds, homeTeam, awayTeam);
      const team_totals_h2 = extractTeamTotalsOdds(team_totals_h2_Odds, homeTeam, awayTeam);

      const oddsData = {
            homeOdds: h2h.homeOdds,
            drawOdds: h2h.drawOdds,
            awayOdds: h2h.awayOdds,
            doubleChance,
            totals,
            bothTeamsToScore,
            spreads,
      };

      return {
            ...oddsData,
            overUnder: {
                  over25: totals.find(t => t.point === 2.5)?.over ?? null,
                  under25: totals.find(t => t.point === 2.5)?.under ?? null,
            },
            // Full-time team totals
            ...(teamTotals.length > 0 ? { teamTotals } : {}),
            // Half-time markets (only include if they have data)
            ...(h2h_h1.homeOdds || h2h_h1.drawOdds || h2h_h1.awayOdds ? {
                  h2h_h1: {
                        home: h2h_h1.homeOdds,
                        draw: h2h_h1.drawOdds,
                        away: h2h_h1.awayOdds,
                  }
            } : {}),
            ...(h2h_h2.homeOdds || h2h_h2.drawOdds || h2h_h2.awayOdds ? {
                  h2h_h2: {
                        home: h2h_h2.homeOdds,
                        draw: h2h_h2.drawOdds,
                        away: h2h_h2.awayOdds,
                  }
            } : {}),
            ...(totals_h1.length > 0 ? { totals_h1 } : {}),
            ...(totals_h2.length > 0 ? { totals_h2 } : {}),
            ...(team_totals_h1.length > 0 ? { team_totals_h1 } : {}),
            ...(team_totals_h2.length > 0 ? { team_totals_h2 } : {}),
            hasValidOdds: hasValidOdds(oddsData),
      };
}

/**
 * Parse all odds from bookmakers array (legacy API format)
 */
export function parseOddsFromBookmakersArray(
      bookmakers: any[],
      homeTeam: string,
      awayTeam: string
) {
      if (!bookmakers || bookmakers.length === 0) {
            return {
                  homeOdds: null,
                  drawOdds: null,
                  awayOdds: null,
                  doubleChance: {
                        homeOrDraw: null,
                        homeOrAway: null,
                        drawOrAway: null,
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
                  overUnder: {
                        over25: null,
                        under25: null,
                  },
                  hasValidOdds: false,
            };
      }

      const h2hMarket = findMarketFromBookmakers(bookmakers, 'h2h');
      const dcMarket = findMarketFromBookmakers(bookmakers, 'double_chance');
      const totalsMarket = findMarketFromBookmakers(bookmakers, 'totals');
      const bttsMarket = findMarketFromBookmakers(bookmakers, 'btts');
      const spreadsMarket = findMarketFromBookmakers(bookmakers, 'spreads');
      const teamTotalsMarket = findMarketFromBookmakers(bookmakers, 'team_totals'); // Full-time team totals

      // Half-time markets
      const h2h_h1_Market = findMarketFromBookmakers(bookmakers, 'h2h_h1');
      const h2h_h2_Market = findMarketFromBookmakers(bookmakers, 'h2h_h2');
      const totals_h1_Market = findMarketFromBookmakers(bookmakers, 'totals_h1');
      const totals_h2_Market = findMarketFromBookmakers(bookmakers, 'totals_h2');
      const team_totals_h1_Market = findMarketFromBookmakers(bookmakers, 'team_totals_h1');
      const team_totals_h2_Market = findMarketFromBookmakers(bookmakers, 'team_totals_h2');

      const h2h = extractH2HOdds(h2hMarket?.outcomes || [], homeTeam, awayTeam);
      const doubleChance = extractDoubleChanceOdds(dcMarket?.outcomes || [], homeTeam, awayTeam);
      const totals = extractTotalsOdds(totalsMarket?.outcomes || []);
      const bothTeamsToScore = extractBTTSOdds(bttsMarket?.outcomes || []);
      const spreads = extractSpreadOdds(spreadsMarket?.outcomes || [], homeTeam, awayTeam);
      const teamTotals = extractTeamTotalsOdds(teamTotalsMarket?.outcomes || [], homeTeam, awayTeam); // Full-time team totals
      
      // Debug logging for team totals
      if (teamTotalsMarket && teamTotalsMarket.outcomes) {
            console.log('🔍 Team Totals Parser Debug:', {
                  marketFound: !!teamTotalsMarket,
                  outcomesCount: teamTotalsMarket.outcomes.length,
                  homeTeam,
                  awayTeam,
                  parsedCount: teamTotals.length,
                  parsed: teamTotals
            });
      }

      // Parse half-time markets
      const h2h_h1 = extractH2HOdds(h2h_h1_Market?.outcomes || [], homeTeam, awayTeam);
      const h2h_h2 = extractH2HOdds(h2h_h2_Market?.outcomes || [], homeTeam, awayTeam);
      const totals_h1 = extractTotalsOdds(totals_h1_Market?.outcomes || []);
      const totals_h2 = extractTotalsOdds(totals_h2_Market?.outcomes || []);
      const team_totals_h1 = extractTeamTotalsOdds(team_totals_h1_Market?.outcomes || [], homeTeam, awayTeam);
      const team_totals_h2 = extractTeamTotalsOdds(team_totals_h2_Market?.outcomes || [], homeTeam, awayTeam);

      const oddsData = {
            homeOdds: h2h.homeOdds,
            drawOdds: h2h.drawOdds,
            awayOdds: h2h.awayOdds,
            doubleChance,
            totals,
            bothTeamsToScore,
            spreads,
      };

      return {
            ...oddsData,
            overUnder: {
                  over25: totals.find(t => t.point === 2.5)?.over ?? null,
                  under25: totals.find(t => t.point === 2.5)?.under ?? null,
            },
            // Full-time team totals
            ...(teamTotals.length > 0 ? { teamTotals } : {}),
            // Half-time markets (only include if they have data)
            ...(h2h_h1.homeOdds || h2h_h1.drawOdds || h2h_h1.awayOdds ? {
                  h2h_h1: {
                        home: h2h_h1.homeOdds,
                        draw: h2h_h1.drawOdds,
                        away: h2h_h1.awayOdds,
                  }
            } : {}),
            ...(h2h_h2.homeOdds || h2h_h2.drawOdds || h2h_h2.awayOdds ? {
                  h2h_h2: {
                        home: h2h_h2.homeOdds,
                        draw: h2h_h2.drawOdds,
                        away: h2h_h2.awayOdds,
                  }
            } : {}),
            ...(totals_h1.length > 0 ? { totals_h1 } : {}),
            ...(totals_h2.length > 0 ? { totals_h2 } : {}),
            ...(team_totals_h1.length > 0 ? { team_totals_h1 } : {}),
            ...(team_totals_h2.length > 0 ? { team_totals_h2 } : {}),
            hasValidOdds: hasValidOdds(oddsData),
      };
}

