import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  IconButton,
  Collapse,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Game } from "../../services/gamesService";
import { GameCardHeader } from "./GameCardHeader";
import { GameDetailsPanel } from "./GameDetailsPanel";
import { H2HSection } from "./H2HSection";
import { DoubleChanceSection } from "./DoubleChanceSection";
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
    odds: number,
    marketKey?: string
  ) => void;
  isSelectionInBetSlip: (
    gameId: string,
    betType: string,
    selection: string,
  ) => boolean;
  isExpanded: boolean;
  onToggleExpanded: (gameId: string, event: React.MouseEvent) => void;
  gameNumber?: number;
  isHighlighted?: boolean;
}

const GameCardComponent: React.FC<GameCardProps> = ({
  game,
  isSelected,
  onSelect,
  onAddToBetSlip,
  isSelectionInBetSlip,
  isExpanded,
  onToggleExpanded,
  gameNumber,
  isHighlighted = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const marketCount = useMemo(() => {
    let count = 1;
    if (
      game.doubleChance?.homeOrDraw ||
      game.doubleChance?.drawOrAway ||
      game.doubleChance?.homeOrAway
    )
      count++;
    if (game.totals && game.totals.length > 0) count++;
    if (game.bothTeamsToScore?.yes || game.bothTeamsToScore?.no) count++;
    if (game.teamTotals && game.teamTotals.length > 0) count++;
    if (game.h2h_h1?.home || game.h2h_h1?.draw || game.h2h_h1?.away) count++;
    if (game.h2h_h2?.home || game.h2h_h2?.draw || game.h2h_h2?.away) count++;
    if (game.totals_h1 && game.totals_h1.length > 0) count++;
    if (game.totals_h2 && game.totals_h2.length > 0) count++;
    if (game.rawMarkets?.length) count = game.rawMarkets.length;
    return count;
  }, [game]);

  return (
    <Card
      sx={{
        mb: 2,
        mx: { xs: 1, sm: 2, md: "25%" },
        cursor: "pointer",
        border: isHighlighted
          ? "2px solid #42a5f5"
          : "1px solid rgba(255, 255, 255, 0.1)",
        background: isHighlighted
          ? "linear-gradient(135deg, rgba(21, 101, 192, 0.15) 0%, rgba(25, 118, 210, 0.08) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
        backdropFilter: "blur(20px)",
        color: "white",
        boxShadow: isHighlighted
          ? "0 0 20px rgba(66, 165, 245, 0.3), 0 4px 16px rgba(0, 0, 0, 0.3)"
          : "none",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: isHighlighted ? "#64b5f6" : "rgba(255, 255, 255, 0.2)",
          boxShadow: isHighlighted
            ? "0 0 24px rgba(66, 165, 245, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)"
            : "0 20px 40px rgba(0, 212, 255, 0.15)",
        },
      }}
      onClick={(event) => {
        onSelect(game);
        onToggleExpanded(game.id, event);
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        {isMobile ? (
          <Box sx={{ mb: 2 }}>
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
        ) : (
          <Box>
          <Box
            sx={{
              overflowX: "auto",
              overflowY: "hidden",
              mb: 2,
              "&::-webkit-scrollbar": { height: "4px" },
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
              sx={{ width: "100%", px: 0.5 }}
            >
              {/* Home Team */}
              <Box
                sx={{
                  flex: "0 0 auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: { xs: "90px", sm: "110px", md: "120px" },
                  maxWidth: { xs: "130px", sm: "160px", md: "180px" },
                  px: 0.5,
                }}
              >
                {game.homeTeamLogo && (
                  <Box
                    component="img"
                    src={game.homeTeamLogo}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    sx={{
                      width: 30,
                      height: 30,
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="white"
                    sx={{
                      fontSize: "0.85rem",
                      lineHeight: 1.2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
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
                    variant="caption"
                    color="rgba(255,255,255,0.5)"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {new Date(game.matchTime).toLocaleDateString()} &middot;{" "}
                    {new Date(game.matchTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* VS */}
              <Box
                sx={{
                  flex: "0 0 auto",
                  px: 1,
                  py: 0.25,
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="rgba(255,255,255,0.6)"
                  sx={{ fontSize: "0.75rem" }}
                >
                  VS
                </Typography>
              </Box>

              {/* Away Team */}
              <Box
                sx={{
                  flex: "0 0 auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: { xs: "90px", sm: "110px", md: "120px" },
                  maxWidth: { xs: "130px", sm: "160px", md: "180px" },
                  px: 0.5,
                }}
              >
                {game.awayTeamLogo && (
                  <Box
                    component="img"
                    src={game.awayTeamLogo}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    sx={{
                      width: 30,
                      height: 30,
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="white"
                    sx={{
                      fontSize: "0.85rem",
                      lineHeight: 1.2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {game.awayTeam}
                  </Typography>
                </Box>
              </Box>

              {/* Score (live/finished) */}
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
                      border: `1px solid ${game.status === "live" ? "rgba(76, 175, 80, 0.3)" : game.status === "finished" ? "rgba(33, 150, 243, 0.3)" : "rgba(255,193,7,0.3)"}`,
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
                      {game.status === "live" && "LIVE: "}
                      {game.status === "finished" && "FINAL: "}
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
                    Odds Not Available
                  </Typography>
                  <Typography variant="caption" color="rgba(255,193,7,0.8)">
                    Betting odds not yet available
                  </Typography>
                </Box>
              )}

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
                      Game{" "}
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

              {/* Double Chance */}
              <DoubleChanceSection
                game={game}
                homeOrDraw={game.doubleChance?.homeOrDraw}
                drawOrAway={game.doubleChance?.drawOrAway}
                homeOrAway={game.doubleChance?.homeOrAway}
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
                variant="desktop"
              />

              {/* O/U 2.5 */}
              <TotalsSection
                game={game}
                totals={game.totals}
                onlyPoint={2.5}
                period="full-time"
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
                variant="desktop"
              />

              {/* BTTS */}
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
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
            </Stack>
          </Box>
          </Box>
        )}

        {/* Expanded: Full Markets Panel */}
        <Collapse
          in={isExpanded}
          timeout="auto"
          unmountOnExit
        >
          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />
          <GameDetailsPanel
            game={game}
            onAddToBetSlip={onAddToBetSlip}
            isSelectionInBetSlip={isSelectionInBetSlip}
          />
        </Collapse>
      </CardContent>
    </Card>
  );
};

export const GameCard = React.memo(GameCardComponent);
