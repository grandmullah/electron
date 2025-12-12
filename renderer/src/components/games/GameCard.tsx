import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  IconButton,
  Collapse,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { Game } from "../../services/gamesService";
import { BettingOption } from "./BettingOption";
import { GameCardHeader } from "./GameCardHeader";
import { H2HSection } from "./H2HSection";
import { DoubleChanceSection } from "./DoubleChanceSection";
import { TeamTotalsSection } from "./TeamTotalsSection";
import { TotalsSection } from "./TotalsSection";
import { BTTSSection } from "./BTTSSection";

interface GameCardProps {
  game: Game;
  isSelected: boolean;
  onSelect: (game: Game) => void;
  onAddToBetSlip: (
    game: Game,
    betType: string,
    selection: string,
    odds: number
  ) => void;
  isSelectionInBetSlip: (
    gameId: string,
    betType: string,
    selection: string
  ) => boolean;
  expandedGames: Set<string>;
  onToggleExpanded: (gameId: string, event: React.MouseEvent) => void;
  gameNumber?: number;
  isHighlighted?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isSelected,
  onSelect,
  onAddToBetSlip,
  isSelectionInBetSlip,
  expandedGames,
  onToggleExpanded,
  gameNumber,
  isHighlighted = false,
}) => {
  // Calculate total market count for navigation button
  const getMarketCount = () => {
    let count = 1; // 3 Way is always present
    if (
      game.doubleChance?.homeOrDraw ||
      game.doubleChance?.drawOrAway ||
      game.doubleChance?.homeOrAway
    )
      count++;
    if (game.totals && game.totals.length > 0) count++;
    if (game.bothTeamsToScore?.yes || game.bothTeamsToScore?.no) count++;
    if (game.teamTotals && game.teamTotals.length > 0) count++; // Full-time team totals
    if (game.h2h_h1?.home || game.h2h_h1?.draw || game.h2h_h1?.away) count++;
    if (game.h2h_h2?.home || game.h2h_h2?.draw || game.h2h_h2?.away) count++;
    if (game.totals_h1 && game.totals_h1.length > 0) count++;
    if (game.totals_h2 && game.totals_h2.length > 0) count++;
    return count;
  };

  const marketCount = getMarketCount();

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  const gameId = game.externalId || game.id;
  const shortId = gameId.length > 8 ? gameId.slice(-8) : gameId;

  return (
    <Card
      sx={{
        mb: 2,
        mx: { xs: 1, sm: 2, md: "25%" },
        cursor: "pointer",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
        backdropFilter: "blur(20px)",
        color: "white",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "rgba(255, 255, 255, 0.2)",
          boxShadow: "0 20px 40px rgba(0, 212, 255, 0.15)",
        },
      }}
      onClick={() => onSelect(game)}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        {/* Mobile Layout - Header with Date/ID and Navigation */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            mb: 2,
          }}
        >
          <GameCardHeader
            game={game}
            marketCount={marketCount}
            onToggleExpanded={onToggleExpanded}
          />
          <H2HSection
            game={game}
            period="full-time"
            homeOdds={game.homeOdds}
            drawOdds={game.drawOdds}
            awayOdds={game.awayOdds}
            onAddToBetSlip={onAddToBetSlip}
            isSelectionInBetSlip={isSelectionInBetSlip}
            variant="mobile"
          />
        </Box>

        {/* Desktop Layout - Original Design */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
          }}
        >
          {/* Game Header and Odds in One Row - Responsive with Horizontal Scroll */}
          <Box
            sx={{
              overflowX: "auto",
              overflowY: "hidden",
              mb: 2,
              "&::-webkit-scrollbar": {
                height: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255,255,255,0.1)",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255,255,255,0.3)",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(255,255,255,0.5)",
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.25, sm: 0.5, md: 0.75 }}
              sx={{
                width: "100%",
                px: 0.5,
              }}
            >
              {/* Home Team */}
              <Box
                textAlign="center"
                sx={{
                  flex: "0 0 auto",
                  minWidth: {
                    xs: "60px",
                    sm: "70px",
                    md: "65px",
                  },
                  maxWidth: {
                    xs: "70px",
                    sm: "80px",
                    md: "75px",
                  },
                  px: 0.5,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="white"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.75rem" },
                    lineHeight: 1.1,
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                  }}
                >
                  {gameNumber && (
                    <Box
                      component="span"
                      sx={{
                        color: "#FFD700",
                        fontWeight: "bold",
                        textShadow: "0 0 2px rgba(255, 215, 0, 0.5)",
                      }}
                    >
                      [{gameNumber}]{" "}
                    </Box>
                  )}
                  {game.homeTeam}
                </Typography>
                <Typography
                  variant="body2"
                  color="rgba(255,255,255,0.6)"
                  sx={{
                    fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.55rem" },
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {new Date(game.matchTime).toLocaleDateString()}
                </Typography>
              </Box>

              {/* VS Divider */}
              <Box
                sx={{
                  flex: "0 0 auto",
                  px: { xs: 0.5, sm: 0.75, md: 0.75 },
                  py: { xs: 0.15, sm: 0.25, md: 0.25 },
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "rgba(255,255,255,0.2)",
                  minWidth: {
                    xs: "30px",
                    sm: "35px",
                    md: "32px",
                  },
                  maxWidth: {
                    xs: "35px",
                    sm: "40px",
                    md: "38px",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="white"
                  sx={{
                    fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem" },
                  }}
                >
                  VS
                </Typography>
              </Box>

              {/* Away Team */}
              <Box
                textAlign="center"
                sx={{
                  flex: "0 0 auto",
                  minWidth: {
                    xs: "60px",
                    sm: "70px",
                    md: "65px",
                  },
                  maxWidth: {
                    xs: "70px",
                    sm: "80px",
                    md: "75px",
                  },
                  px: 0.5,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="white"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.75rem" },
                    lineHeight: 1.1,
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                  }}
                >
                  {game.awayTeam}
                </Typography>
                <Typography
                  variant="body2"
                  color="rgba(255,255,255,0.6)"
                  sx={{
                    fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.55rem" },
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {new Date(game.matchTime).toLocaleTimeString()}
                </Typography>
              </Box>

              {/* Game Info - Show scores if available */}
              {game.currentScore &&
                (game.currentScore.home > 0 || game.currentScore.away > 0) && (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 1,
                      mb: 2,
                      bgcolor:
                        game.status === "live"
                          ? "rgba(76, 175, 80, 0.1)"
                          : game.status === "finished"
                            ? "rgba(33, 150, 243, 0.1)"
                            : "rgba(255,193,7,0.1)",
                      border: `1px solid ${
                        game.status === "live"
                          ? "rgba(76, 175, 80, 0.3)"
                          : game.status === "finished"
                            ? "rgba(33, 150, 243, 0.3)"
                            : "rgba(255,193,7,0.3)"
                      }`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={
                        game.status === "live"
                          ? "success.main"
                          : game.status === "finished"
                            ? "info.main"
                            : "warning.main"
                      }
                    >
                      {game.status === "live" && "🔴 LIVE: "}
                      {game.status === "finished" && "✅ FINAL: "}
                      {game.currentScore.home} - {game.currentScore.away}
                    </Typography>
                    {game.currentTime && (
                      <Typography
                        variant="caption"
                        color="rgba(255,255,255,0.7)"
                      >
                        {game.currentTime}
                      </Typography>
                    )}
                  </Box>
                )}

              {/* No Odds Available Indicator - Only show for upcoming games */}
              {!game.hasValidOdds && game.status === "scheduled" && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 1.5,
                    mb: 2,
                    bgcolor: "rgba(255,193,7,0.1)",
                    border: "1px solid rgba(255,193,7,0.3)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="warning.main"
                    fontWeight="bold"
                  >
                    ⚠️ Odds Not Available
                  </Typography>
                  <Typography variant="caption" color="rgba(255,193,7,0.8)">
                    This game is scheduled but betting odds are not yet
                    available
                  </Typography>
                </Box>
              )}

              {/* Finished/Live Games Info - Show even without odds */}
              {!game.hasValidOdds &&
                (game.status === "finished" || game.status === "live") && (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 1.5,
                      mb: 2,
                      bgcolor: "rgba(33, 150, 243, 0.1)",
                      border: "1px solid rgba(33, 150, 243, 0.3)",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="info.main"
                      fontWeight="bold"
                    >
                      ℹ️ Game{" "}
                      {game.status === "finished" ? "Finished" : "In Progress"}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="rgba(33, 150, 243, 0.8)"
                    >
                      ID: ...{game.externalId?.slice(-8) || game.id.slice(-8)}
                    </Typography>
                  </Box>
                )}

              {/* 3 Way Odds */}
              <H2HSection
                game={game}
                period="full-time"
                homeOdds={game.homeOdds}
                drawOdds={game.drawOdds}
                awayOdds={game.awayOdds}
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
                variant="desktop"
              />

              {/* Double Chance Odds */}
              <DoubleChanceSection
                game={game}
                homeOrDraw={game.doubleChance?.homeOrDraw}
                drawOrAway={game.doubleChance?.drawOrAway}
                homeOrAway={game.doubleChance?.homeOrAway}
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
                variant="desktop"
              />

              {/* Totals Odds - Dynamic width based on content */}
              <TotalsSection
                game={game}
                totals={game.totals}
                period="full-time"
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
                variant="desktop"
              />

              {/* Both Teams to Score Odds */}
              <BTTSSection
                game={game}
                yes={game.bothTeamsToScore?.yes}
                no={game.bothTeamsToScore?.no}
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
                variant="desktop"
              />
              {/* Expand Arrow */}
              <Box textAlign="center" mt={2}>
                <IconButton
                  onClick={(e) => onToggleExpanded(game.id, e)}
                  sx={{
                    transform: expandedGames.has(game.id)
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
            </Stack>
          </Box>

          {/* Mobile Expanded Section - Additional Markets */}
          <Collapse
            in={expandedGames.has(game.id)}
            timeout="auto"
            unmountOnExit
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

            {/* Both Teams to Score */}
            {(game.bothTeamsToScore?.yes || game.bothTeamsToScore?.no) && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    fontWeight: "bold",
                    color: "rgba(255, 255, 255, 0.9)",
                    textTransform: "uppercase",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  BOTH TEAMS TO SCORE
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        YES (GG)
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="Both Teams To Score"
                        selection="Yes"
                        odds={game.bothTeamsToScore?.yes}
                        label="Yes"
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        onAddToBetSlip={onAddToBetSlip}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        NO (NG)
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="Both Teams To Score"
                        selection="No"
                        odds={game.bothTeamsToScore?.no}
                        label="No"
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        onAddToBetSlip={onAddToBetSlip}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* Double Chance */}
            {(game.doubleChance?.homeOrDraw ||
              game.doubleChance?.drawOrAway ||
              game.doubleChance?.homeOrAway) && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    fontWeight: "bold",
                    color: "rgba(255, 255, 255, 0.9)",
                    textTransform: "uppercase",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  DOUBLE CHANCE
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        1 OR X
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="Double Chance"
                        selection="1 or X"
                        odds={game.doubleChance?.homeOrDraw}
                        label="1X"
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        onAddToBetSlip={onAddToBetSlip}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        X OR 2
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="Double Chance"
                        selection="X or 2"
                        odds={game.doubleChance?.drawOrAway}
                        label="X2"
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        onAddToBetSlip={onAddToBetSlip}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        1 OR 2
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="Double Chance"
                        selection="1 or 2"
                        odds={game.doubleChance?.homeOrAway}
                        label="12"
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        onAddToBetSlip={onAddToBetSlip}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* Total Goals Over/Under - Full Time */}
            <TotalsSection
              game={game}
              totals={game.totals}
              period="full-time"
              onAddToBetSlip={onAddToBetSlip}
              isSelectionInBetSlip={isSelectionInBetSlip}
              variant="mobile"
            />

            {/* 3 Way - First Half */}
            {game.h2h_h1 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    fontWeight: "bold",
                    color: "rgba(255, 255, 255, 0.9)",
                    textTransform: "uppercase",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  3 WAY - FIRST HALF
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        HOME
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="1st Half 3 Way"
                        selection="Home"
                        odds={game.h2h_h1.home}
                        label="1"
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        onAddToBetSlip={onAddToBetSlip}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        DRAW
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="1st Half 3 Way"
                        selection="Draw"
                        odds={game.h2h_h1.draw}
                        label="X"
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        onAddToBetSlip={onAddToBetSlip}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        AWAY
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="1st Half 3 Way"
                        selection="Away"
                        odds={game.h2h_h1.away}
                        label="2"
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        onAddToBetSlip={onAddToBetSlip}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* 3 Way - Second Half */}
            {game.h2h_h2 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    fontWeight: "bold",
                    color: "rgba(255, 255, 255, 0.9)",
                    textTransform: "uppercase",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  3 WAY - SECOND HALF
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        HOME
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="2nd Half 3 Way"
                        selection="Home"
                        odds={game.h2h_h2.home}
                        label="1"
                        onAddToBetSlip={onAddToBetSlip}
                        isSelectionInBetSlip={isSelectionInBetSlip}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        DRAW
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="2nd Half 3 Way"
                        selection="Draw"
                        odds={game.h2h_h2.draw}
                        label="X"
                        onAddToBetSlip={onAddToBetSlip}
                        isSelectionInBetSlip={isSelectionInBetSlip}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "block",
                          mb: 0.5,
                          fontWeight: 600,
                        }}
                      >
                        AWAY
                      </Typography>
                      <BettingOption
                        game={game}
                        betType="2nd Half 3 Way"
                        selection="Away"
                        odds={game.h2h_h2.away}
                        label="2"
                        isSelectionInBetSlip={isSelectionInBetSlip}
                        onAddToBetSlip={onAddToBetSlip}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            )}
          </Collapse>

          {/* Desktop Expanded Section - Half-Time Markets */}
          <Collapse
            in={expandedGames.has(game.id)}
            timeout="auto"
            unmountOnExit
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

            {/* Horizontal scrollable container like main row */}
            <Box
              sx={{
                overflowX: "auto",
                overflowY: "hidden",
                mb: 2,
                "&::-webkit-scrollbar": {
                  height: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "2px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "2px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "rgba(255,255,255,0.5)",
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 0.25, sm: 0.5, md: 0.75 }}
                sx={{
                  width: "100%",
                  px: 0.5,
                }}
              >
                {/* First Half H2H */}
                {game.h2h_h1 && (
                  <Box
                    textAlign="center"
                    sx={{
                      flex: "1 1 0",
                      minWidth: 0,
                      px: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="rgba(255,255,255,0.8)"
                      gutterBottom
                      display="block"
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },
                      }}
                    >
                      1ST HALF - 3 WAY
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Box textAlign="center">
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.6)"
                          display="block"
                          mb={0.5}
                        >
                          1
                        </Typography>
                        <BettingOption
                          game={game}
                          betType="1st Half 3 Way"
                          selection="Home"
                          odds={game.h2h_h1.home}
                          label="1"
                          isSelectionInBetSlip={isSelectionInBetSlip}
                          onAddToBetSlip={onAddToBetSlip}
                        />
                      </Box>
                      <Box textAlign="center">
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.6)"
                          display="block"
                          mb={0.5}
                        >
                          X
                        </Typography>
                        <BettingOption
                          game={game}
                          betType="1st Half 3 Way"
                          selection="Draw"
                          odds={game.h2h_h1.draw}
                          label="X"
                          isSelectionInBetSlip={isSelectionInBetSlip}
                          onAddToBetSlip={onAddToBetSlip}
                        />
                      </Box>
                      <Box textAlign="center">
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.6)"
                          display="block"
                          mb={0.5}
                        >
                          2
                        </Typography>
                        <BettingOption
                          game={game}
                          betType="1st Half 3 Way"
                          selection="Away"
                          odds={game.h2h_h1.away}
                          label="2"
                          isSelectionInBetSlip={isSelectionInBetSlip}
                          onAddToBetSlip={onAddToBetSlip}
                        />
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Second Half H2H */}
                {game.h2h_h2 && (
                  <Box
                    textAlign="center"
                    sx={{
                      flex: "1 1 0",
                      minWidth: 0,
                      px: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="rgba(255,255,255,0.8)"
                      gutterBottom
                      display="block"
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },
                      }}
                    >
                      2ND HALF - 3 WAY
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Box textAlign="center">
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.6)"
                          display="block"
                          mb={0.5}
                        >
                          1
                        </Typography>
                        <BettingOption
                          game={game}
                          betType="2nd Half 3 Way"
                          selection="Home"
                          odds={game.h2h_h2.home}
                          label="1"
                          isSelectionInBetSlip={isSelectionInBetSlip}
                          onAddToBetSlip={onAddToBetSlip}
                        />
                      </Box>
                      <Box textAlign="center">
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.6)"
                          display="block"
                          mb={0.5}
                        >
                          X
                        </Typography>
                        <BettingOption
                          game={game}
                          betType="2nd Half 3 Way"
                          selection="Draw"
                          odds={game.h2h_h2.draw}
                          label="X"
                          isSelectionInBetSlip={isSelectionInBetSlip}
                          onAddToBetSlip={onAddToBetSlip}
                        />
                      </Box>
                      <Box textAlign="center">
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.6)"
                          display="block"
                          mb={0.5}
                        >
                          2
                        </Typography>
                        <BettingOption
                          game={game}
                          betType="2nd Half 3 Way"
                          selection="Away"
                          odds={game.h2h_h2.away}
                          label="2"
                          isSelectionInBetSlip={isSelectionInBetSlip}
                          onAddToBetSlip={onAddToBetSlip}
                        />
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* First Half Totals */}
                <TotalsSection
                  game={game}
                  totals={game.totals_h1 || []}
                  period="first-half"
                  onAddToBetSlip={onAddToBetSlip}
                  isSelectionInBetSlip={isSelectionInBetSlip}
                  variant="desktop"
                />

                {/* Second Half Totals */}
                <TotalsSection
                  game={game}
                  totals={game.totals_h2 || []}
                  period="second-half"
                  onAddToBetSlip={onAddToBetSlip}
                  isSelectionInBetSlip={isSelectionInBetSlip}
                  variant="desktop"
                />

                {/* Full-Time Team Totals */}
                <TeamTotalsSection
                  game={game}
                  teamTotals={game.teamTotals || []}
                  period="full-time"
                  onAddToBetSlip={onAddToBetSlip}
                  isSelectionInBetSlip={isSelectionInBetSlip}
                  variant="desktop"
                />

                {/* First Half Team Totals */}
                <TeamTotalsSection
                  game={game}
                  teamTotals={game.team_totals_h1 || []}
                  period="first-half"
                  onAddToBetSlip={onAddToBetSlip}
                  isSelectionInBetSlip={isSelectionInBetSlip}
                  variant="desktop"
                />

                {/* Second Half Team Totals */}
                <TeamTotalsSection
                  game={game}
                  teamTotals={game.team_totals_h2 || []}
                  period="second-half"
                  onAddToBetSlip={onAddToBetSlip}
                  isSelectionInBetSlip={isSelectionInBetSlip}
                  variant="desktop"
                />
              </Stack>
            </Box>

            {/* No Extra Odds Available */}
            {!game.h2h_h1 &&
              !game.h2h_h2 &&
              (!game.totals_h1 || game.totals_h1.length === 0) &&
              (!game.totals_h2 || game.totals_h2.length === 0) &&
              (!game.teamTotals || game.teamTotals.length === 0) &&
              (!game.team_totals_h1 || game.team_totals_h1.length === 0) &&
              (!game.team_totals_h2 || game.team_totals_h2.length === 0) && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 2,
                    mx: 2,
                    bgcolor: "rgba(255,193,7,0.05)",
                    border: "1px dashed rgba(255,193,7,0.3)",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="rgba(255,193,7,0.8)">
                    ℹ️ No additional half-time markets available for this game
                  </Typography>
                </Box>
              )}
          </Collapse>
        </Box>
      </CardContent>
    </Card>
  );
};
