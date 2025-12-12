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
    odds: number
  ) => void;
  isSelectionInBetSlip: (
    gameId: string,
    betType: string,
    selection: string
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
          <Grid item xs={4}>
            <Box
              sx={{
                textAlign: "center",
                py: 1,
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
                }}
              >
                1
              </Typography>
              <BettingOption
                game={game}
                betType={betType}
                selection="Home"
                odds={homeOdds}
                label="1"
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                textAlign: "center",
                py: 1,
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
                }}
              >
                X
              </Typography>
              <BettingOption
                game={game}
                betType={betType}
                selection="Draw"
                odds={drawOdds}
                label="X"
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                textAlign: "center",
                py: 1,
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
                }}
              >
                2
              </Typography>
              <BettingOption
                game={game}
                betType={betType}
                selection="Away"
                odds={awayOdds}
                label="2"
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
              />
            </Box>
          </Grid>
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
            betType={betType}
            selection="Home"
            odds={homeOdds}
            label="1"
            onAddToBetSlip={onAddToBetSlip}
            isSelectionInBetSlip={isSelectionInBetSlip}
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
            betType={betType}
            selection="Draw"
            odds={drawOdds}
            label="X"
            onAddToBetSlip={onAddToBetSlip}
            isSelectionInBetSlip={isSelectionInBetSlip}
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
            betType={betType}
            selection="Away"
            odds={awayOdds}
            label="2"
            onAddToBetSlip={onAddToBetSlip}
            isSelectionInBetSlip={isSelectionInBetSlip}
          />
        </Box>
      </Stack>
    </Box>
  );
};


