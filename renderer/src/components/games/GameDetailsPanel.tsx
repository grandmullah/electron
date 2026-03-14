import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Game } from "../../services/gamesService";

type MarketCategory =
  | "ALL" | "MAIN" | "GOALS" | "HALVES" | "SPREADS"
  | "TEAM" | "CORNERS" | "CARDS" | "STATS" | "SCORE";

const MARKET_TITLES: Record<string, string> = {
  h2h: "3 WAY", h2h_h1: "3 WAY - 1ST HALF", h2h_h2: "3 WAY - 2ND HALF",
  h2h_15_minutes: "1X2 (15 MIN)", h2h_30_minutes: "1X2 (30 MIN)",
  h2h_60_minutes: "1X2 (60 MIN)", h2h_75_minutes: "1X2 (75 MIN)",
  h2h_10_minutes: "1X2 (10 MIN)", h2h_first_team_to_score_h1: "1ST TO SCORE (1H)",
  totals: "TOTAL GOALS", totals_h1: "1ST HALF O/U", totals_h2: "2ND HALF O/U",
  result_totals: "RESULT + TOTAL", totals_1_15_minutes: "O/U 1-15 MIN",
  totals_16_30_minutes: "O/U 16-30 MIN", totals_31_45_minutes: "O/U 31-45 MIN",
  totals_46_60_minutes: "O/U 46-60 MIN", totals_61_75_minutes: "O/U 61-75 MIN",
  totals_76_90_minutes: "O/U 76-90 MIN", totals_15_30_minutes: "O/U 15-30 MIN",
  totals_30_45_minutes: "O/U 30-45 MIN",
  totals_corners: "CORNERS O/U", totals_corners_h1: "1ST HALF CORNERS",
  totals_corners_h2: "2ND HALF CORNERS", totals_corners_home: "HOME CORNERS",
  totals_corners_away: "AWAY CORNERS",
  totals_cards: "CARDS O/U", totals_cards_0_10_m: "CARDS 0-10 MIN",
  totals_yellow_cards: "YELLOW CARDS", totals_yellow_cards_h1: "1H YELLOW CARDS",
  totals_yellow_cards_h2: "2H YELLOW CARDS",
  totals_fouls: "FOULS O/U", totals_fouls_home: "HOME FOULS",
  totals_fouls_away: "AWAY FOULS", totals_tackles: "TACKLES O/U",
  totals_shots: "SHOTS O/U", totals_shotongoal: "SHOTS ON GOAL",
  totals_offsides: "OFFSIDES O/U", totals_offsides_home: "HOME OFFSIDES",
  totals_offsides_away: "AWAY OFFSIDES",
  spreads: "ASIAN HANDICAP", btts: "BOTH TEAMS TO SCORE",
  double_chance: "DOUBLE CHANCE", team_totals: "TEAM TOTALS",
  team_totals_h1: "1ST HALF TEAM TOTALS", team_totals_h2: "2ND HALF TEAM TOTALS",
  correct_score: "CORRECT SCORE", correct_score_h1: "1H CORRECT SCORE",
  correct_score_h2: "2H CORRECT SCORE",
};

const CATEGORY_MARKETS: Record<MarketCategory, string[] | null> = {
  ALL: null,
  MAIN: ["h2h", "totals", "double_chance", "btts"],
  GOALS: ["totals", "totals_h1", "totals_h2", "result_totals",
    "totals_1_15_minutes", "totals_16_30_minutes", "totals_31_45_minutes",
    "totals_46_60_minutes", "totals_61_75_minutes", "totals_76_90_minutes",
    "totals_15_30_minutes", "totals_30_45_minutes"],
  HALVES: ["h2h_h1", "h2h_h2", "totals_h1", "totals_h2",
    "h2h_15_minutes", "h2h_30_minutes", "h2h_60_minutes", "h2h_75_minutes",
    "h2h_10_minutes", "team_totals_h1", "team_totals_h2"],
  SPREADS: ["spreads"],
  TEAM: ["team_totals", "team_totals_h1", "team_totals_h2"],
  CORNERS: ["totals_corners", "totals_corners_h1", "totals_corners_h2",
    "totals_corners_home", "totals_corners_away"],
  CARDS: ["totals_cards", "totals_cards_0_10_m",
    "totals_yellow_cards", "totals_yellow_cards_h1", "totals_yellow_cards_h2"],
  STATS: ["totals_fouls", "totals_fouls_home", "totals_fouls_away",
    "totals_tackles", "totals_shots", "totals_shotongoal",
    "totals_offsides", "totals_offsides_home", "totals_offsides_away"],
  SCORE: ["correct_score", "correct_score_h1", "correct_score_h2"],
};

const DISPLAY_ORDER = [
  "h2h", "double_chance", "btts", "spreads", "totals",
  "h2h_h1", "h2h_h2", "totals_h1", "totals_h2",
  "team_totals", "team_totals_h1", "team_totals_h2",
  "correct_score", "correct_score_h1", "correct_score_h2",
  "totals_corners", "totals_corners_h1", "totals_corners_h2",
  "totals_corners_home", "totals_corners_away",
  "totals_cards", "totals_yellow_cards",
  "totals_fouls", "totals_shots", "totals_shotongoal", "totals_offsides",
];

interface GameDetailsPanelProps {
  game: Game;
  onAddToBetSlip: (game: Game, betType: string, selection: string, odds: number) => void;
  isSelectionInBetSlip: (gameId: string, betType: string, selection: string) => boolean;
}

type Outcome = { name: string; price: number; point?: number; description?: string };

export const GameDetailsPanel: React.FC<GameDetailsPanelProps> = ({
  game,
  onAddToBetSlip,
  isSelectionInBetSlip,
}) => {
  const [activeTab, setActiveTab] = useState<MarketCategory>("ALL");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) =>
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const markets = useMemo(() => {
    const map = new Map<string, Outcome[]>();

    if (game.rawMarkets?.length) {
      for (const m of game.rawMarkets) {
        if (!m.key || !m.outcomes?.length) continue;
        if (!map.has(m.key)) map.set(m.key, []);
        map.get(m.key)!.push(
          ...m.outcomes.map((o) => ({
            name: o.name, price: o.price,
            ...(o.point != null ? { point: o.point } : {}),
            ...(o.description ? { description: o.description } : {}),
          }))
        );
      }
    }

    if (!map.has("h2h") && (game.homeOdds ?? game.drawOdds ?? game.awayOdds)) {
      const arr: Outcome[] = [];
      if (game.homeOdds != null) arr.push({ name: game.homeTeam, price: Number(game.homeOdds) });
      if (game.drawOdds != null) arr.push({ name: "Draw", price: Number(game.drawOdds) });
      if (game.awayOdds != null) arr.push({ name: game.awayTeam, price: Number(game.awayOdds) });
      if (arr.length) map.set("h2h", arr);
    }
    if (!map.has("totals") && game.totals?.length) {
      const arr: Outcome[] = [];
      for (const t of game.totals) {
        if (t.over != null) arr.push({ name: "Over", price: Number(t.over), point: t.point });
        if (t.under != null) arr.push({ name: "Under", price: Number(t.under), point: t.point });
      }
      if (arr.length) map.set("totals", arr);
    }
    if (!map.has("double_chance") && (game.doubleChance?.homeOrDraw ?? game.doubleChance?.homeOrAway ?? game.doubleChance?.drawOrAway)) {
      const arr: Outcome[] = [];
      if (game.doubleChance?.homeOrDraw != null) arr.push({ name: `${game.homeTeam} or Draw`, price: Number(game.doubleChance.homeOrDraw) });
      if (game.doubleChance?.homeOrAway != null) arr.push({ name: `${game.homeTeam} or ${game.awayTeam}`, price: Number(game.doubleChance.homeOrAway) });
      if (game.doubleChance?.drawOrAway != null) arr.push({ name: `Draw or ${game.awayTeam}`, price: Number(game.doubleChance.drawOrAway) });
      if (arr.length) map.set("double_chance", arr);
    }
    if (!map.has("btts") && (game.bothTeamsToScore?.yes ?? game.bothTeamsToScore?.no)) {
      const arr: Outcome[] = [];
      if (game.bothTeamsToScore?.yes != null) arr.push({ name: "Yes", price: Number(game.bothTeamsToScore.yes) });
      if (game.bothTeamsToScore?.no != null) arr.push({ name: "No", price: Number(game.bothTeamsToScore.no) });
      if (arr.length) map.set("btts", arr);
    }
    if (!map.has("spreads") && (game.spreads?.homeSpreadOdds ?? game.spreads?.awaySpreadOdds)) {
      const arr: Outcome[] = [];
      if (game.spreads?.homeSpreadOdds != null) arr.push({ name: game.homeTeam, price: Number(game.spreads.homeSpreadOdds), point: Number(game.spreads.homeSpread) || undefined });
      if (game.spreads?.awaySpreadOdds != null) arr.push({ name: game.awayTeam, price: Number(game.spreads.awaySpreadOdds), point: Number(game.spreads.awaySpread) || undefined });
      if (arr.length) map.set("spreads", arr);
    }

    return map;
  }, [game]);

  const sortedKeys = useMemo(() => {
    const keys = Array.from(markets.keys());
    return keys.sort((a, b) => {
      const ai = DISPLAY_ORDER.indexOf(a);
      const bi = DISPLAY_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [markets]);

  const availableCategories = useMemo(() => {
    const cats: MarketCategory[] = ["ALL"];
    for (const [cat, marketKeys] of Object.entries(CATEGORY_MARKETS) as [MarketCategory, string[] | null][]) {
      if (cat === "ALL") continue;
      if (marketKeys && marketKeys.some((k) => markets.has(k))) cats.push(cat);
    }
    return cats;
  }, [markets]);

  const filteredKeys = useMemo(() => {
    if (activeTab === "ALL") return sortedKeys;
    const allowed = CATEGORY_MARKETS[activeTab];
    if (!allowed) return sortedKeys;
    return sortedKeys.filter((k) => allowed.includes(k));
  }, [activeTab, sortedKeys]);

  if (markets.size === 0) {
    return (
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", py: 1 }}>
        No odds data available for this game.
      </Typography>
    );
  }

  const betTypeForMarket = (marketKey: string, outcome: Outcome): string => {
    const title = MARKET_TITLES[marketKey] || marketKey;
    if (outcome.point != null && !title.includes("1X2") && !title.includes("3 WAY") && !title.includes("SCORE") && !title.includes("DOUBLE")) {
      return `${title} ${outcome.point}`;
    }
    return title;
  };

  const selectionLabel = (_mk: string, outcome: Outcome): string => {
    if (outcome.point != null) {
      const base = outcome.name.replace(/over|under/i, "").trim();
      const dir = outcome.name.toLowerCase().includes("over") ? "Over" : outcome.name.toLowerCase().includes("under") ? "Under" : outcome.name;
      if (!base) return `${dir} ${outcome.point}`;
      return `${base} ${dir} ${outcome.point}`;
    }
    return outcome.name;
  };

  const OddsBtn: React.FC<{ outcome: Outcome; marketKey: string; label: string }> = ({ outcome, marketKey, label }) => {
    const betType = betTypeForMarket(marketKey, outcome);
    const selection = selectionLabel(marketKey, outcome);
    const isSelected = isSelectionInBetSlip(game.id, betType, selection);
    const numericOdds = outcome.price;
    const isClickable = !!numericOdds && !isNaN(numericOdds);

    return (
      <Box
        textAlign="center"
        sx={{
          flex: "0 0 auto",
          width: { xs: "calc(33.33% - 8px)", sm: "calc(16.66% - 8px)", md: "calc(14.28% - 8px)" },
          minWidth: 55,
        }}
      >
        <Typography
          variant="caption"
          color="rgba(255,255,255,0.6)"
          display="block"
          mb={0.25}
          sx={{ fontSize: "0.58rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {label}
        </Typography>
        <Button
          variant={isSelected ? "contained" : "outlined"}
          size="small"
          disabled={!isClickable}
          onClick={(e) => {
            e.stopPropagation();
            if (isClickable) onAddToBetSlip(game, betType, selection, numericOdds);
          }}
          sx={{
            minWidth: "fit-content",
            width: "100%",
            height: "auto",
            fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.65rem" },
            fontWeight: 600,
            color: "white",
            borderColor: isClickable
              ? isSelected ? "primary.main" : "rgba(25, 118, 210, 0.5)"
              : "rgba(255,255,255,0.3)",
            bgcolor: isSelected
              ? "primary.main"
              : isClickable ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
            padding: "4px 4px",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              bgcolor: isClickable
                ? isSelected ? "primary.main" : "rgba(25, 118, 210, 0.2)"
                : "rgba(255,255,255,0.1)",
              borderColor: isClickable ? "primary.main" : "rgba(255,255,255,0.3)",
            },
            "&.Mui-disabled": {
              color: "rgba(255,255,255,0.3)",
              borderColor: "rgba(255,255,255,0.1)",
              bgcolor: "rgba(255,255,255,0.05)",
            },
          }}
        >
          {numericOdds?.toFixed(2) || "-"}
        </Button>
      </Box>
    );
  };

  const outcomeLabel = (o: Outcome): string => {
    if (o.point != null) {
      const short = o.name.replace(/^Over$/i, "O").replace(/^Under$/i, "U");
      return `${short} ${o.point}`;
    }
    return o.name;
  };

  const SectionBlock: React.FC<{ marketKey: string; outcomes: Outcome[] }> = ({ marketKey, outcomes }) => {
    const collapsed = collapsedSections[marketKey];
    const title = MARKET_TITLES[marketKey] || marketKey.replace(/_/g, " ").toUpperCase();
    const grouped = groupOutcomes(marketKey, outcomes);

    return (
      <Box
        sx={{
          py: 1,
          px: 0.5,
          bgcolor: "rgba(255, 255, 255, 0.02)",
          borderRadius: 1,
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <Box
          onClick={() => toggleSection(marketKey)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            mb: collapsed ? 0 : 1,
          }}
        >
          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{
              fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },
              color: "rgba(255, 255, 255, 0.8)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {title}
          </Typography>
          <ExpandMoreIcon
            sx={{
              fontSize: 16,
              color: "rgba(255,255,255,0.4)",
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </Box>
        {!collapsed && (
          <Box>
            {grouped.map((group, gi) => (
              <Box key={gi} sx={{ mb: gi < grouped.length - 1 ? 1 : 0 }}>
                {group.label && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.6rem",
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {group.label}
                  </Typography>
                )}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {group.outcomes.map((o, i) => (
                    <OddsBtn
                      key={`${o.name}-${o.point ?? ""}-${i}`}
                      outcome={o}
                      marketKey={marketKey}
                      label={outcomeLabel(o)}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {availableCategories.length > 2 && (
        <>
          <Stack direction="row" spacing={0.75} sx={{ mb: 1.5, flexWrap: "wrap", gap: 0.5 }}>
            {availableCategories.map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                variant={activeTab === label ? "filled" : "outlined"}
                onClick={(e) => { e.stopPropagation(); setActiveTab(label); }}
                sx={{
                  height: 24,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: activeTab === label ? "#0a1628" : "rgba(255,255,255,0.6)",
                  bgcolor: activeTab === label ? "#f5c542" : "transparent",
                  borderColor: activeTab === label ? "#f5c542" : "rgba(255,255,255,0.12)",
                  "&:hover": { bgcolor: activeTab === label ? "#f5c542" : "rgba(255,255,255,0.06)" },
                }}
              />
            ))}
          </Stack>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1.5 }} />
        </>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: 1.5,
          alignItems: "start",
        }}
      >
        {filteredKeys.map((key) => {
          const outcomes = markets.get(key);
          if (!outcomes?.length) return null;
          const isWide = outcomes.length > 6;
          return (
            <Box key={key} sx={{ gridColumn: isWide ? "1 / -1" : undefined }}>
              <SectionBlock marketKey={key} outcomes={outcomes} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

function groupOutcomes(
  marketKey: string,
  outcomes: Outcome[]
): Array<{ label?: string; outcomes: Outcome[] }> {
  const hasPoints = outcomes.some((o) => o.point != null);
  const hasDescriptions = outcomes.some((o) => o.description);

  if (marketKey === "team_totals" || marketKey === "team_totals_h1" || marketKey === "team_totals_h2") {
    const byTeam = new Map<string, Outcome[]>();
    for (const o of outcomes) {
      const team = o.description || (o.name.toLowerCase().includes("home") ? "Home" : "Away");
      if (!byTeam.has(team)) byTeam.set(team, []);
      byTeam.get(team)!.push(o);
    }
    return Array.from(byTeam.entries()).map(([team, outs]) => ({
      label: team,
      outcomes: outs.sort((a, b) => (a.point ?? 0) - (b.point ?? 0)),
    }));
  }

  if (hasPoints && !hasDescriptions) {
    const sorted = [...outcomes].sort((a, b) => {
      const pa = a.point ?? 0;
      const pb = b.point ?? 0;
      if (pa !== pb) return pa - pb;
      const aOver = a.name.toLowerCase().includes("over") ? 0 : 1;
      const bOver = b.name.toLowerCase().includes("over") ? 0 : 1;
      return aOver - bOver;
    });
    return [{ outcomes: sorted }];
  }

  return [{ outcomes }];
}
