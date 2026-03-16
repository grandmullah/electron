import React from "react";
import { Box, Typography, Stack, Grid } from "@mui/material";
import { Game } from "../../services/gamesService";
import { BettingOption } from "./BettingOption";

interface H2HSectionProps {
  game: Game;
  period?: "full-time" | "first-half" | "second-half";
  homeOdds?: number | string | null;
  drawOdds?: number | string | null;
  awayOdds?: number | string | null;
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
  variant?: "mobile" | "desktop";
}

export const H2HSection: React.FC<H2HSectionProps> = ({
  game,
  period = "full-time",
  homeOdds,
  drawOdds,
  awayOdds,
  onAddToBetSlip,
  isSelectionInBetSlip,
  variant = "desktop",
}) => {
  const getBetType = () => {
    switch (period) {
      case "full-time":
        return "3 Way";
      case "first-half":
        return "1st Half 3 Way";
      case "second-half":
        return "2nd Half 3 Way";
      default:
        return "3 Way";
    }
  };

  const getTitle = () => {
    switch (period) {
      case "full-time":
        return variant === "mobile" ? "3 WAY - FULL TIME" : "3 WAY";
      case "first-half":
        return "3 WAY - FIRST HALF";
      case "second-half":
        return "3 WAY - SECOND HALF";
      default:
        return "3 WAY";
    }
  };

  const betType = getBetType();

  if (variant === "mobile") {
    return (
      <>
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
            color: "rgba(255, 255, 255, 0.6)",
            mb: 2,
          }}
        >
          {getTitle()}
        </Typography>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {(
            [
              ["Home", "1", homeOdds],
              ["Draw", "X", drawOdds],
              ["Away", "2", awayOdds],
            ] as const
          ).map(([sel, lbl, odds]) => {
            const gameKey = game.externalId || game.id;
            const selected = isSelectionInBetSlip(gameKey, betType, sel);
            return (
              <Grid size={4} key={sel}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: 1,
                    bgcolor: selected
                      ? "rgba(255, 193, 7, 0.25)"
                      : "rgba(255, 255, 255, 0.05)",
                    borderRadius: 1,
                    border: selected
                      ? "2px solid #FFC107"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: selected
                      ? "0 0 14px rgba(255, 193, 7, 0.6)"
                      : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                      color: selected ? "#FFE082" : "rgba(255, 255, 255, 0.7)",
                      fontWeight: selected ? 700 : 400,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {lbl}
                  </Typography>
                  <BettingOption
                    game={game}
                    betType={betType}
                    selection={sel}
                    odds={odds}
                    label={lbl}
                    onAddToBetSlip={onAddToBetSlip}
                    isSelectionInBetSlip={isSelectionInBetSlip}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </>
    );
  }

  // Desktop variant
  return (
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
        {getTitle()}
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="center">
        {(
          [
            ["Home", "1", homeOdds],
            ["Draw", "X", drawOdds],
            ["Away", "2", awayOdds],
          ] as const
        ).map(([sel, lbl, odds]) => {
          const gameKey = game.externalId || game.id;
          const selected = isSelectionInBetSlip(gameKey, betType, sel);
          return (
            <Box
              key={sel}
              textAlign="center"
              sx={{
                px: 0.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: selected ? "rgba(255, 193, 7, 0.25)" : "transparent",
                border: selected
                  ? "2px solid #FFC107"
                  : "1px solid transparent",
                boxShadow: selected
                  ? "0 0 14px rgba(255, 193, 7, 0.6)"
                  : "none",
                transition: "all 0.2s ease",
              }}
            >
              <Typography
                variant="caption"
                color={selected ? "#FFE082" : "rgba(255,255,255,0.6)"}
                fontWeight={selected ? 700 : 400}
                display="block"
                mb={0.5}
              >
                {lbl}
              </Typography>
              <BettingOption
                game={game}
                betType={betType}
                selection={sel}
                odds={odds}
                label={lbl}
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
              />
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
