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
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Game } from "../../services/gamesService";

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
  const BettingOption = ({
    betType,
    selection,
    odds,
    label,
  }: {
    betType: string;
    selection: string;
    odds: number | string | null | undefined;
    label: string;
  }) => {
    const numericOdds = typeof odds === "string" ? parseFloat(odds) : odds;
    const isClickable = !!numericOdds && !isNaN(numericOdds);
    const isSelected = isSelectionInBetSlip(game.id, betType, selection);
    const reducedOdds = numericOdds;

    return (
      <Button
        variant={isSelected ? "contained" : "outlined"}
        size="small"
        disabled={!isClickable}
        onClick={() =>
          isClickable && onAddToBetSlip(game, betType, selection, numericOdds!)
        }
        sx={{
          minWidth: "fit-content",
          height: "auto",
          fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.65rem" },
          fontWeight: 600,
          color: isSelected ? "white" : "white",
          borderColor: isClickable ? "primary.main" : "rgba(255,255,255,0.3)",
          bgcolor: isSelected ? "primary.main" : "rgba(255,255,255,0.1)",
          padding: { xs: "4px 6px", sm: "6px 8px", md: "8px 10px" },
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            bgcolor: isClickable ? "primary.main" : "rgba(255,255,255,0.1)",
          },
          "&.Mui-disabled": {
            color: "rgba(255,255,255,0.3)",
            borderColor: "rgba(255,255,255,0.1)",
            bgcolor: "rgba(255,255,255,0.05)",
          },
        }}
      >
        {reducedOdds?.toFixed(2) || "-"}
      </Button>
    );
  };

  return (
    <Card
      sx={{
        mb: 2,
        mx: "25%", // 25% margin on left and right
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
      <CardContent sx={{ p: 3 }}>
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
                sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem" } }}
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
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                      {game.currentTime}
                    </Typography>
                  )}
                </Box>
              )}

            {/* No Odds Available Indicator - Only show for upcoming games */}
            {!game.hasValidOdds && game.status === "upcoming" && (
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
                  This game is scheduled but betting odds are not yet available
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
                  <Typography variant="caption" color="rgba(33, 150, 243, 0.8)">
                    ID: ...{game.externalId?.slice(-8) || game.id.slice(-8)}
                  </Typography>
                </Box>
              )}

            {/* 3 Way Odds */}
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
                sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" } }}
              >
                3 WAY
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
                    betType="3 Way"
                    selection="Home"
                    odds={game.homeOdds}
                    label="1"
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
                    betType="3 Way"
                    selection="Draw"
                    odds={game.drawOdds}
                    label="X"
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
                    betType="3 Way"
                    selection="Away"
                    odds={game.awayOdds}
                    label="2"
                  />
                </Box>
              </Stack>
            </Box>

            {/* Double Chance Odds */}
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
                sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" } }}
              >
                DOUBLE CHANCE
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.6)"
                    display="block"
                    mb={0.5}
                  >
                    1X
                  </Typography>
                  <BettingOption
                    betType="Double Chance"
                    selection="1 or X"
                    odds={game.doubleChance?.homeOrDraw}
                    label="1X"
                  />
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.6)"
                    display="block"
                    mb={0.5}
                  >
                    X2
                  </Typography>
                  <BettingOption
                    betType="Double Chance"
                    selection="X or 2"
                    odds={game.doubleChance?.drawOrAway}
                    label="X2"
                  />
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.6)"
                    display="block"
                    mb={0.5}
                  >
                    12
                  </Typography>
                  <BettingOption
                    betType="Double Chance"
                    selection="1 or 2"
                    odds={game.doubleChance?.homeOrAway}
                    label="12"
                  />
                </Box>
              </Stack>
            </Box>

            {/* Totals Odds - Dynamic width based on content */}
            {game.totals &&
              game.totals.length > 0 &&
              (() => {
                // Filter out .25 and .75 points if corresponding .5 exists
                const allPoints = game.totals.map((t) => t.point);
                const filteredTotals = game.totals.filter((total) => {
                  const point = total.point;
                  const decimal = point % 1; // Get decimal part

                  // If it's .25 or .75, check if corresponding .5 exists
                  if (decimal === 0.25) {
                    const correspondingHalf = Math.floor(point) + 0.5;
                    return !allPoints.includes(correspondingHalf);
                  }
                  if (decimal === 0.75) {
                    const correspondingHalf = Math.floor(point) + 0.5;
                    return !allPoints.includes(correspondingHalf);
                  }

                  // Keep all other points (.0, .5)
                  return true;
                });

                return filteredTotals.length > 0 ? (
                  <Box
                    textAlign="center"
                    sx={{
                      flex: "0 0 auto",
                      minWidth: "fit-content",
                      maxWidth: {
                        xs: "280px",
                        sm: "350px",
                        md: "400px",
                      },
                      px: 0.5,
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="rgba(255,255,255,0.8)"
                      gutterBottom
                      display="block"
                      mb={0.5}
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },
                      }}
                    >
                      TOTALS
                    </Typography>

                    {/* Totals layout: 3 points per row */}
                    <Box sx={{ overflow: "hidden" }}>
                      {/* Create rows of 3 totals each */}
                      {Array.from(
                        { length: Math.ceil(filteredTotals.length / 3) },
                        (_, rowIndex) => (
                          <Stack
                            key={rowIndex}
                            direction="row"
                            spacing={{ xs: 0.4, sm: 0.5, md: 0.6 }}
                            justifyContent="space-between"
                            mb={
                              rowIndex <
                              Math.ceil(filteredTotals.length / 3) - 1
                                ? 0.5
                                : 0
                            }
                            sx={{ overflow: "hidden", width: "100%" }}
                          >
                            {filteredTotals
                              .sort((a, b) => a.point - b.point) // Sort by point value ascending
                              .slice(rowIndex * 3, (rowIndex + 1) * 3)
                              .map((total, index) => (
                                <Box
                                  key={rowIndex * 3 + index}
                                  textAlign="center"
                                  sx={{
                                    flex: "1 1 0",
                                    minWidth: 0,
                                    overflow: "hidden",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="rgba(255,255,255,0.6)"
                                    display="block"
                                    mb={0.1}
                                    sx={{
                                      fontSize: {
                                        xs: "0.45rem",
                                        sm: "0.5rem",
                                        md: "0.55rem",
                                      },
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {total.point}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    spacing={{ xs: 0.5, sm: 0.6, md: 0.7 }}
                                    justifyContent="center"
                                  >
                                    <Box
                                      textAlign="center"
                                      sx={{
                                        flex: "1 1 0",
                                        minWidth: {
                                          xs: "24px",
                                          sm: "28px",
                                          md: "32px",
                                        },
                                        maxWidth: {
                                          xs: "35px",
                                          sm: "40px",
                                          md: "45px",
                                        },
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="rgba(255,255,255,0.4)"
                                        display="block"
                                        mb={0.05}
                                        sx={{
                                          fontSize: {
                                            xs: "0.35rem",
                                            sm: "0.4rem",
                                            md: "0.45rem",
                                          },
                                        }}
                                      >
                                        O
                                      </Typography>
                                      <BettingOption
                                        betType={`Over/Under ${total.point}`}
                                        selection={`Over ${total.point}`}
                                        odds={total.over}
                                        label="Over"
                                      />
                                    </Box>
                                    <Box
                                      textAlign="center"
                                      sx={{
                                        flex: "1 1 0",
                                        minWidth: {
                                          xs: "24px",
                                          sm: "28px",
                                          md: "32px",
                                        },
                                        maxWidth: {
                                          xs: "35px",
                                          sm: "40px",
                                          md: "45px",
                                        },
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="rgba(255,255,255,0.4)"
                                        display="block"
                                        mb={0.05}
                                        sx={{
                                          fontSize: {
                                            xs: "0.35rem",
                                            sm: "0.4rem",
                                            md: "0.45rem",
                                          },
                                        }}
                                      >
                                        U
                                      </Typography>
                                      <BettingOption
                                        betType={`Over/Under ${total.point}`}
                                        selection={`Under ${total.point}`}
                                        odds={total.under}
                                        label="Under"
                                      />
                                    </Box>
                                  </Stack>
                                </Box>
                              ))}
                          </Stack>
                        )
                      )}
                    </Box>
                  </Box>
                ) : null;
              })()}

            {/* Both Teams to Score Odds */}
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
                sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" } }}
              >
                BTTS
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.6)"
                    display="block"
                    mb={0.5}
                  >
                    Yes
                  </Typography>
                  <BettingOption
                    betType="Both Teams To Score"
                    selection="Yes"
                    odds={game.bothTeamsToScore?.yes}
                    label="Yes"
                  />
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.6)"
                    display="block"
                    mb={0.5}
                  >
                    No
                  </Typography>
                  <BettingOption
                    betType="Both Teams To Score"
                    selection="No"
                    odds={game.bothTeamsToScore?.no}
                    label="No"
                  />
                </Box>
              </Stack>
            </Box>
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

        {/* Expanded Section - Half-Time Markets */}
        <Collapse in={expandedGames.has(game.id)} timeout="auto" unmountOnExit>
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
                        betType="1st Half 3 Way"
                        selection="Home"
                        odds={game.h2h_h1.home}
                        label="1"
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
                        betType="1st Half 3 Way"
                        selection="Draw"
                        odds={game.h2h_h1.draw}
                        label="X"
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
                        betType="1st Half 3 Way"
                        selection="Away"
                        odds={game.h2h_h1.away}
                        label="2"
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
                        betType="2nd Half 3 Way"
                        selection="Home"
                        odds={game.h2h_h2.home}
                        label="1"
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
                        betType="2nd Half 3 Way"
                        selection="Draw"
                        odds={game.h2h_h2.draw}
                        label="X"
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
                        betType="2nd Half 3 Way"
                        selection="Away"
                        odds={game.h2h_h2.away}
                        label="2"
                      />
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* First Half Totals */}
              {game.totals_h1 && game.totals_h1.length > 0 && (
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
                    1ST HALF - O/U
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {game.totals_h1.slice(0, 1).map((total, idx) => (
                      <React.Fragment key={idx}>
                        <Box textAlign="center">
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.6)"
                            display="block"
                            mb={0.5}
                          >
                            O{total.point}
                          </Typography>
                          <BettingOption
                            betType="1st Half Over/Under"
                            selection={`Over ${total.point}`}
                            odds={total.over}
                            label={`O${total.point}`}
                          />
                        </Box>
                        <Box textAlign="center">
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.6)"
                            display="block"
                            mb={0.5}
                          >
                            U{total.point}
                          </Typography>
                          <BettingOption
                            betType="1st Half Over/Under"
                            selection={`Under ${total.point}`}
                            odds={total.under}
                            label={`U${total.point}`}
                          />
                        </Box>
                      </React.Fragment>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Second Half Totals */}
              {game.totals_h2 && game.totals_h2.length > 0 && (
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
                    2ND HALF - O/U
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {game.totals_h2.slice(0, 1).map((total, idx) => (
                      <React.Fragment key={idx}>
                        <Box textAlign="center">
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.6)"
                            display="block"
                            mb={0.5}
                          >
                            O{total.point}
                          </Typography>
                          <BettingOption
                            betType="2nd Half Over/Under"
                            selection={`Over ${total.point}`}
                            odds={total.over}
                            label={`O${total.point}`}
                          />
                        </Box>
                        <Box textAlign="center">
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.6)"
                            display="block"
                            mb={0.5}
                          >
                            U{total.point}
                          </Typography>
                          <BettingOption
                            betType="2nd Half Over/Under"
                            selection={`Under ${total.point}`}
                            odds={total.under}
                            label={`U${total.point}`}
                          />
                        </Box>
                      </React.Fragment>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* First Half Team Totals */}
              {game.team_totals_h1 &&
                game.team_totals_h1.length > 0 &&
                (() => {
                  // Filter out .25 and .75 points if corresponding .5 exists
                  const allPoints = game.team_totals_h1.map((t) => t.point);
                  const filteredTeamTotals = game.team_totals_h1.filter(
                    (total) => {
                      const point = total.point;
                      const decimal = point % 1;

                      if (decimal === 0.25) {
                        const correspondingHalf = Math.floor(point) + 0.5;
                        return !allPoints.includes(correspondingHalf);
                      }
                      if (decimal === 0.75) {
                        const correspondingHalf = Math.floor(point) + 0.5;
                        return !allPoints.includes(correspondingHalf);
                      }

                      return true;
                    }
                  );

                  return filteredTeamTotals.length > 0 ? (
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
                          fontSize: {
                            xs: "0.6rem",
                            sm: "0.65rem",
                            md: "0.7rem",
                          },
                        }}
                      >
                        1ST HALF - TEAM O/U
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        {filteredTeamTotals
                          .slice(0, 2)
                          .map((teamTotal, idx) => {
                            const teamName =
                              (teamTotal.team === "home"
                                ? game.homeTeam
                                : game.awayTeam) || "";
                            const shortName = (
                              teamName.split(" ").slice(-1)[0] || ""
                            ).substring(0, 4);
                            return (
                              <React.Fragment key={idx}>
                                <Box textAlign="center">
                                  <Typography
                                    variant="caption"
                                    color="rgba(255,255,255,0.6)"
                                    display="block"
                                    mb={0.5}
                                    sx={{ fontSize: "0.55rem" }}
                                  >
                                    {shortName} O{teamTotal.point}
                                  </Typography>
                                  <BettingOption
                                    betType="1st Half Team Total"
                                    selection={`${teamName} Over ${teamTotal.point}`}
                                    odds={teamTotal.over}
                                    label={`O${teamTotal.point}`}
                                  />
                                </Box>
                                <Box textAlign="center">
                                  <Typography
                                    variant="caption"
                                    color="rgba(255,255,255,0.6)"
                                    display="block"
                                    mb={0.5}
                                    sx={{ fontSize: "0.55rem" }}
                                  >
                                    {shortName} U{teamTotal.point}
                                  </Typography>
                                  <BettingOption
                                    betType="1st Half Team Total"
                                    selection={`${teamName} Under ${teamTotal.point}`}
                                    odds={teamTotal.under}
                                    label={`U${teamTotal.point}`}
                                  />
                                </Box>
                              </React.Fragment>
                            );
                          })}
                      </Stack>
                    </Box>
                  ) : null;
                })()}

              {/* Second Half Team Totals */}
              {game.team_totals_h2 &&
                game.team_totals_h2.length > 0 &&
                (() => {
                  // Filter out .25 and .75 points if corresponding .5 exists
                  const allPoints = game.team_totals_h2.map((t) => t.point);
                  const filteredTeamTotals = game.team_totals_h2.filter(
                    (total) => {
                      const point = total.point;
                      const decimal = point % 1;

                      if (decimal === 0.25) {
                        const correspondingHalf = Math.floor(point) + 0.5;
                        return !allPoints.includes(correspondingHalf);
                      }
                      if (decimal === 0.75) {
                        const correspondingHalf = Math.floor(point) + 0.5;
                        return !allPoints.includes(correspondingHalf);
                      }

                      return true;
                    }
                  );

                  return filteredTeamTotals.length > 0 ? (
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
                          fontSize: {
                            xs: "0.6rem",
                            sm: "0.65rem",
                            md: "0.7rem",
                          },
                        }}
                      >
                        2ND HALF - TEAM O/U
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        {filteredTeamTotals
                          .slice(0, 2)
                          .map((teamTotal, idx) => {
                            const teamName =
                              (teamTotal.team === "home"
                                ? game.homeTeam
                                : game.awayTeam) || "";
                            const shortName = (
                              teamName.split(" ").slice(-1)[0] || ""
                            ).substring(0, 4);
                            return (
                              <React.Fragment key={idx}>
                                <Box textAlign="center">
                                  <Typography
                                    variant="caption"
                                    color="rgba(255,255,255,0.6)"
                                    display="block"
                                    mb={0.5}
                                    sx={{ fontSize: "0.55rem" }}
                                  >
                                    {shortName} O{teamTotal.point}
                                  </Typography>
                                  <BettingOption
                                    betType="2nd Half Team Total"
                                    selection={`${teamName} Over ${teamTotal.point}`}
                                    odds={teamTotal.over}
                                    label={`O${teamTotal.point}`}
                                  />
                                </Box>
                                <Box textAlign="center">
                                  <Typography
                                    variant="caption"
                                    color="rgba(255,255,255,0.6)"
                                    display="block"
                                    mb={0.5}
                                    sx={{ fontSize: "0.55rem" }}
                                  >
                                    {shortName} U{teamTotal.point}
                                  </Typography>
                                  <BettingOption
                                    betType="2nd Half Team Total"
                                    selection={`${teamName} Under ${teamTotal.point}`}
                                    odds={teamTotal.under}
                                    label={`U${teamTotal.point}`}
                                  />
                                </Box>
                              </React.Fragment>
                            );
                          })}
                      </Stack>
                    </Box>
                  ) : null;
                })()}
            </Stack>
          </Box>

          {/* No Extra Odds Available */}
          {!game.h2h_h1 &&
            !game.h2h_h2 &&
            (!game.totals_h1 || game.totals_h1.length === 0) &&
            (!game.totals_h2 || game.totals_h2.length === 0) &&
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
      </CardContent>
    </Card>
  );
};
