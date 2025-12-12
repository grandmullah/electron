import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Game } from "../../services/gamesService";
import { BettingOption } from "./BettingOption";

interface TeamTotalsSectionProps {
  game: Game;
  teamTotals?: Array<{
    team: string;
    point: number;
    over: number | string | null;
    under: number | string | null;
  }>;
  period: "full-time" | "first-half" | "second-half";
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
  variant?: "mobile" | "desktop";
}

export const TeamTotalsSection: React.FC<TeamTotalsSectionProps> = ({
  game,
  teamTotals,
  period,
  onAddToBetSlip,
  isSelectionInBetSlip,
  variant = "mobile",
}) => {
  if (!teamTotals || teamTotals.length === 0) return null;

  // Filter out .25 and .75 points if corresponding .5 exists
  const allPoints = teamTotals.map((t) => t.point);
  const hasValue = (value: number) => {
    return allPoints.some((p) => Math.abs(p - value) < 0.001);
  };

  const filteredTeamTotals = teamTotals.filter((total) => {
    const point = total.point;
    const decimal = point % 1;
    const isWholeNumber =
      Math.abs(decimal) < 0.001 || Math.abs(decimal - 1) < 0.001;

    if (isWholeNumber) {
      const correspondingHalf = Math.floor(point) + 0.5;
      return !hasValue(correspondingHalf);
    }
    if (Math.abs(decimal - 0.25) < 0.001) {
      const correspondingHalf = Math.floor(point) + 0.5;
      return !hasValue(correspondingHalf);
    }
    if (Math.abs(decimal - 0.75) < 0.001) {
      const correspondingHalf = Math.floor(point) + 0.5;
      return !hasValue(correspondingHalf);
    }
    return true;
  });

  // Group by point value, combining home and away
  const pointsMap = new Map<number, { home?: any; away?: any }>();
  filteredTeamTotals.forEach((total) => {
    if (!pointsMap.has(total.point)) {
      pointsMap.set(total.point, {});
    }
    const entry = pointsMap.get(total.point)!;
    if (total.team === "home") {
      entry.home = total;
    } else if (total.team === "away") {
      entry.away = total;
    }
  });

  // Convert to sorted array
  const sortedPoints = Array.from(pointsMap.entries()).sort(
    (a, b) => a[0] - b[0]
  );

  if (sortedPoints.length === 0) return null;

  const getTitle = () => {
    switch (period) {
      case "full-time":
        return "FULL TIME - TEAM O/U";
      case "first-half":
        return "1ST HALF - TEAM O/U";
      case "second-half":
        return "2ND HALF - TEAM O/U";
      default:
        return "TEAM O/U";
    }
  };

  const getBetType = () => {
    switch (period) {
      case "full-time":
        return "Full Time Team Total";
      case "first-half":
        return "1st Half Team Total";
      case "second-half":
        return "2nd Half Team Total";
      default:
        return "Team Total";
    }
  };

  const getTeamAbbreviation = (teamName: string) => {
    if (!teamName) return "";
    const words = teamName.split(" ");
    // Find the first word that is more than 3 characters
    const longWord = words.find(word => word.length > 3);
    if (longWord) {
      return longWord.substring(0, 3).toUpperCase();
    }
    // Fallback: use first word if no word is longer than 3 characters
    return words[0] ? words[0].substring(0, 3).toUpperCase() : "";
  };

  const containerSx = variant === "desktop" 
    ? {
        textAlign: "center" as const,
        flex: "0 0 auto",
        minWidth: "fit-content",
        px: 0.5,
      }
    : { mb: 3 };

  return (
    <Box sx={containerSx}>
      <Typography
        variant="caption"
        display="block"
        fontWeight={variant === "desktop" ? "bold" : undefined}
        color={variant === "desktop" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.7)"}
        gutterBottom={variant === "desktop"}
        sx={{
          fontSize: {
            xs: "0.6rem",
            sm: "0.65rem",
            md: "0.7rem",
          },
        }}
      >
        {getTitle()}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        flexWrap="wrap"
        gap={0.5}
      >
        {sortedPoints.map(([point, teams]) => (
          <Box key={point} textAlign="center">
            <Typography
              variant="caption"
              color="rgba(255,255,255,0.75)"
              display="block"
              mb={0.5}
              fontWeight={600}
              sx={{ 
                fontSize: {
                  xs: "0.75rem",
                  sm: "0.8rem",
                  md: "0.85rem",
                },
              }}
            >
              {point}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {teams.home && (
                <Stack direction="column" spacing={0.3}>
                  <Box textAlign="center">
                    <Typography
                      variant="caption"
                      color="rgba(255,255,255,0.7)"
                      display="block"
                      mb={0.3}
                      fontWeight={600}
                      sx={{ 
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                          md: "0.75rem",
                        },
                      }}
                    >
                      {getTeamAbbreviation(game.homeTeam)} O
                    </Typography>
                    <BettingOption
                      game={game}
                      betType={getBetType()}
                      selection={`${game.homeTeam} Over ${point}`}
                      odds={teams.home.over}
                      label="O"
                      onAddToBetSlip={onAddToBetSlip}
                      isSelectionInBetSlip={isSelectionInBetSlip}
                    />
                  </Box>
                  <Box textAlign="center">
                    <Typography
                      variant="caption"
                      color="rgba(255,255,255,0.7)"
                      display="block"
                      mb={0.3}
                      fontWeight={600}
                      sx={{ 
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                          md: "0.75rem",
                        },
                      }}
                    >
                      {getTeamAbbreviation(game.homeTeam)} U
                    </Typography>
                    <BettingOption
                      game={game}
                      betType={getBetType()}
                      selection={`${game.homeTeam} Under ${point}`}
                      odds={teams.home.under}
                      label="U"
                      onAddToBetSlip={onAddToBetSlip}
                      isSelectionInBetSlip={isSelectionInBetSlip}
                    />
                  </Box>
                </Stack>
              )}
              {teams.away && (
                <Stack direction="column" spacing={0.3}>
                  <Box textAlign="center">
                    <Typography
                      variant="caption"
                      color="rgba(255,255,255,0.7)"
                      display="block"
                      mb={0.3}
                      fontWeight={600}
                      sx={{ 
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                          md: "0.75rem",
                        },
                      }}
                    >
                      {getTeamAbbreviation(game.awayTeam)} O
                    </Typography>
                    <BettingOption
                      game={game}
                      betType={getBetType()}
                      selection={`${game.awayTeam} Over ${point}`}
                      odds={teams.away.over}
                      label="O"
                      onAddToBetSlip={onAddToBetSlip}
                      isSelectionInBetSlip={isSelectionInBetSlip}
                    />
                  </Box>
                  <Box textAlign="center">
                    <Typography
                      variant="caption"
                      color="rgba(255,255,255,0.7)"
                      display="block"
                      mb={0.3}
                      fontWeight={600}
                      sx={{ 
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                          md: "0.75rem",
                        },
                      }}
                    >
                      {getTeamAbbreviation(game.awayTeam)} U
                    </Typography>
                    <BettingOption
                      game={game}
                      betType={getBetType()}
                      selection={`${game.awayTeam} Under ${point}`}
                      odds={teams.away.under}
                      label="U"
                      onAddToBetSlip={onAddToBetSlip}
                      isSelectionInBetSlip={isSelectionInBetSlip}
                    />
                  </Box>
                </Stack>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

