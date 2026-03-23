/**
 * Odds Parser Utility
 * Reusable functions for parsing odds from various data structures
 */

import { GameOdds } from '../types/games';

/**
 * Map API/source market keys to internal market keys.
 * Ensures all supported market types are recognized when parsing odds.
 */
// export const MARKET_KEY_TO_INTERNAL: Record<string, string> = {
//       match_winner: 'h2h',
//       first_half_winner: 'h2h_h1',
//       second_half_winner: 'h2h_h2',
//       '1x2_15_minutes': 'h2h_15_minutes',
//       '1x2_30_minutes': 'h2h_30_minutes',
//       '1x2_60_minutes': 'h2h_60_minutes',
//       '1x2_75_minutes': 'h2h_75_minutes',
//       first_10_min_winner: 'h2h_10_minutes',
//       first_team_to_score_3_way_1st_half: 'h2h_first_team_to_score_h1',
//       goals_over_under: 'totals',
//       goals_over_under_first_half: 'totals_h1',
//       goals_over_under_second_half: 'totals_h2',
//       goal_line: 'totals',
//       goal_line_1st_half: 'totals_h1',
//       result_total_goals: 'result_totals',
//       goal_in_1_15_minutes: 'totals_1_15_minutes',
//       goal_in_16_30_minutes: 'totals_16_30_minutes',
//       goal_in_31_45_minutes: 'totals_31_45_minutes',
//       goal_in_46_60_minutes: 'totals_46_60_minutes',
//       goal_in_61_75_minutes: 'totals_61_75_minutes',
//       goal_in_76_90_minutes: 'totals_76_90_minutes',
//       over_under_15m_30m: 'totals_15_30_minutes',
//       over_under_30m_45m: 'totals_30_45_minutes',
//       corners_over_under: 'totals_corners',
//       total_corners_1st_half: 'totals_corners_h1',
//       total_corners_2nd_half: 'totals_corners_h2',
//       home_corners_over_under: 'totals_corners_home',
//       away_corners_over_under: 'totals_corners_away',
//       cards_over_under: 'totals_cards',
//       cards_over_under_between_0_and_10_m: 'totals_cards_0_10_m',
//       yellow_over_under: 'totals_yellow_cards',
//       yellow_over_under_1st_half: 'totals_yellow_cards_h1',
//       yellow_over_under_2nd_half: 'totals_yellow_cards_h2',
//       fouls_total: 'totals_fouls',
//       fouls_home_total: 'totals_fouls_home',
//       fouls_away_total: 'totals_fouls_away',
//       total_tackles: 'totals_tackles',
//       total_shots: 'totals_shots',
//       total_shotongoal: 'totals_shotongoal',
//       offsides_total: 'totals_offsides',
//       offsides_home_total: 'totals_offsides_home',
//       offsides_away_total: 'totals_offsides_away',
//       exact_score: 'correct_score',
//       correct_score_first_half: 'correct_score_h1',
//       correct_score_second_half: 'correct_score_h2',
//       asian_handicap: 'spreads',
//       both_teams_score: 'btts',
//       double_chance: 'double_chance',
//       total_home: 'team_totals',
//       total_away: 'team_totals',
// };

/** Normalize API market_key to internal key (e.g. match_winner → h2h). */
export function normalizeMarketKey(raw: string | undefined): string {
      if (raw == null || raw === '') return raw || '';
      return raw;
}

/**
 * Preferred API market keys for each internal key (for placing bets).
 * Backend expects the same keys as in the odds feed (e.g. match_winner, goals_over_under).
 */
// export const INTERNAL_TO_API_MARKET_KEY: Record<string, string> = {
//       h2h: 'h2h',
//       h2h_h1: 'first_half_winner',
//       h2h_h2: 'second_half_winner',
//       h2h_15_minutes: '1x2_15_minutes',
//       h2h_30_minutes: '1x2_30_minutes',
//       h2h_60_minutes: '1x2_60_minutes',
//       h2h_75_minutes: '1x2_75_minutes',
//       h2h_10_minutes: 'first_10_min_winner',
//       h2h_first_team_to_score_h1: 'first_team_to_score_3_way_1st_half',
//       totals: 'goals_over_under',
//       totals_h1: 'goals_over_under_first_half',
//       totals_h2: 'goals_over_under_second_half',
//       result_totals: 'result_total_goals',
//       totals_1_15_minutes: 'goal_in_1_15_minutes',
//       totals_16_30_minutes: 'goal_in_16_30_minutes',
//       totals_31_45_minutes: 'goal_in_31_45_minutes',
//       totals_46_60_minutes: 'goal_in_46_60_minutes',
//       totals_61_75_minutes: 'goal_in_61_75_minutes',
//       totals_76_90_minutes: 'goal_in_76_90_minutes',
//       totals_15_30_minutes: 'over_under_15m_30m',
//       totals_30_45_minutes: 'over_under_30m_45m',
//       totals_corners: 'corners_over_under',
//       totals_corners_h1: 'total_corners_1st_half',
//       totals_corners_h2: 'total_corners_2nd_half',
//       totals_corners_home: 'home_corners_over_under',
//       totals_corners_away: 'away_corners_over_under',
//       totals_cards: 'cards_over_under',
//       totals_cards_0_10_m: 'cards_over_under_between_0_and_10_m',
//       totals_yellow_cards: 'yellow_over_under',
//       totals_yellow_cards_h1: 'yellow_over_under_1st_half',
//       totals_yellow_cards_h2: 'yellow_over_under_2nd_half',
//       totals_fouls: 'fouls_total',
//       totals_fouls_home: 'fouls_home_total',
//       totals_fouls_away: 'fouls_away_total',
//       totals_tackles: 'total_tackles',
//       totals_shots: 'total_shots',
//       totals_shotongoal: 'total_shotongoal',
//       totals_offsides: 'offsides_total',
//       totals_offsides_home: 'offsides_home_total',
//       totals_offsides_away: 'offsides_away_total',
//       correct_score: 'exact_score',
//       correct_score_h1: 'correct_score_first_half',
//       correct_score_h2: 'correct_score_second_half',
//       spreads: 'asian_handicap',
//       btts: 'both_teams_score',
//       double_chance: 'double_chance',
//       team_totals: 'total_home', // backend may use total_home / total_away by outcome
//       team_totals_h1: 'team_totals_h1',
//       team_totals_h2: 'team_totals_h2',
// };

/** Convert internal market key to API key for bet placement (e.g. h2h → match_winner). */
export function toApiMarketKey(internalKey: string | undefined): string {
      if (internalKey == null || internalKey === '') return internalKey || '';
      return internalKey;
}

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
 * Find market from bookmakers array (legacy format).
 * Matches by internal key or any API alias (e.g. match_winner → h2h).
 */
export function findMarketFromBookmakers(bookmakers: any[], internalMarketKey: string): any {
      for (const bm of bookmakers) {
            const market = bm?.markets?.find((m: any) => {
                  const raw = m?.key;
                  return raw === internalMarketKey || normalizeMarketKey(raw) === internalMarketKey;
            });
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
      const sourceOdds = odds || [];

      // Build raw markets and internal-key buckets in one pass to avoid repeated filters.
      const rawMarketMap = new Map<string, Array<{ name: string; price: number; point?: number; description?: string }>>();
      const internalMarketMap = new Map<string, GameOdds[]>();

      for (const o of sourceOdds) {
            if (!o?.market_key) continue;

            const rawKey = o.market_key;
            const rawOutcomes = rawMarketMap.get(rawKey) || [];
            rawOutcomes.push({
                  name: o.outcome_name,
                  price: Number(o.outcome_price) || 0,
                  ...(o.outcome_point != null ? { point: Number(o.outcome_point) } : {}),
            });
            rawMarketMap.set(rawKey, rawOutcomes);

            const internalKey = normalizeMarketKey(rawKey);
            const list = internalMarketMap.get(internalKey) || [];
            list.push(o);
            internalMarketMap.set(internalKey, list);
      }

      const rawMarkets = Array.from(rawMarketMap.entries()).map(([key, outcomes]) => ({ key, outcomes }));

      // Group odds by internal market type for the high-level fields
      const h2hOdds = internalMarketMap.get('h2h') || [];
      const dcOdds = internalMarketMap.get('double_chance') || [];
      const totalsOdds = internalMarketMap.get('totals') || [];
      const bttsOdds = internalMarketMap.get('btts') || [];
      const spreadsOdds = internalMarketMap.get('spreads') || [];
      const teamTotalsOdds = internalMarketMap.get('team_totals') || [];

      // Half-time markets
      const h2h_h1_Odds = internalMarketMap.get('h2h_h1') || [];
      const h2h_h2_Odds = internalMarketMap.get('h2h_h2') || [];
      const totals_h1_Odds = internalMarketMap.get('totals_h1') || [];
      const totals_h2_Odds = internalMarketMap.get('totals_h2') || [];
      const team_totals_h1_Odds = internalMarketMap.get('team_totals_h1') || [];
      const team_totals_h2_Odds = internalMarketMap.get('team_totals_h2') || [];

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
            ...(rawMarkets.length > 0 ? { rawMarkets } : {}),
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

      // Collect all markets in one pass for both raw display and fast lookups.
      const rawMarketMap = new Map<string, Array<{ name: string; price: number; point?: number; description?: string }>>();
      const internalOutcomeMap = new Map<string, any[]>();
      for (const bm of bookmakers) {
            if (!Array.isArray(bm.markets)) continue;
            for (const m of bm.markets) {
                  if (!m.key || !Array.isArray(m.outcomes) || m.outcomes.length === 0) continue;
                  const mapped = m.outcomes.map((o: any) => ({
                        name: o.name as string,
                        price: Number(o.price) || 0,
                        ...(o.point != null ? { point: Number(o.point) } : {}),
                        ...(o.description ? { description: o.description as string } : {}),
                  }));

                  const rawList = rawMarketMap.get(m.key) || [];
                  rawList.push(...mapped);
                  rawMarketMap.set(m.key, rawList);

                  const internalKey = normalizeMarketKey(m.key);
                  const internalList = internalOutcomeMap.get(internalKey) || [];
                  internalList.push(...m.outcomes);
                  internalOutcomeMap.set(internalKey, internalList);
            }
      }
      const rawMarkets = Array.from(rawMarketMap.entries()).map(([key, outcomes]) => ({ key, outcomes }));

      const h2h = extractH2HOdds(internalOutcomeMap.get('h2h') || [], homeTeam, awayTeam);
      const doubleChance = extractDoubleChanceOdds(internalOutcomeMap.get('double_chance') || [], homeTeam, awayTeam);
      const totals = extractTotalsOdds(internalOutcomeMap.get('totals') || []);
      const bothTeamsToScore = extractBTTSOdds(internalOutcomeMap.get('btts') || []);
      const spreads = extractSpreadOdds(internalOutcomeMap.get('spreads') || [], homeTeam, awayTeam);
      const teamTotals = extractTeamTotalsOdds(internalOutcomeMap.get('team_totals') || [], homeTeam, awayTeam);

      // Parse half-time markets
      const h2h_h1 = extractH2HOdds(internalOutcomeMap.get('h2h_h1') || [], homeTeam, awayTeam);
      const h2h_h2 = extractH2HOdds(internalOutcomeMap.get('h2h_h2') || [], homeTeam, awayTeam);
      const totals_h1 = extractTotalsOdds(internalOutcomeMap.get('totals_h1') || []);
      const totals_h2 = extractTotalsOdds(internalOutcomeMap.get('totals_h2') || []);
      const team_totals_h1 = extractTeamTotalsOdds(internalOutcomeMap.get('team_totals_h1') || [], homeTeam, awayTeam);
      const team_totals_h2 = extractTeamTotalsOdds(internalOutcomeMap.get('team_totals_h2') || [], homeTeam, awayTeam);

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
            ...(rawMarkets.length > 0 ? { rawMarkets } : {}),
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

