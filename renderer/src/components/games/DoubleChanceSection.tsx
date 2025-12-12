import React from "react";
import { Box, Typography, Stack, Grid } from "@mui/material";
import { Game } from "../../services/gamesService";
import { BettingOption } from "./BettingOption";

interface DoubleChanceSectionProps {
  game: Game;
  homeOrDraw?: number | string | null;
  drawOrAway?: number | string | null;
  homeOrAway?: number | string | null;
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

export const DoubleChanceSection: React.FC<DoubleChanceSectionProps> = ({
  game,
  homeOrDraw,
  drawOrAway,
  homeOrAway,
  onAddToBetSlip,
  isSelectionInBetSlip,
  variant = "desktop",
}) => {
  if (!homeOrDraw && !drawOrAway && !homeOrAway) return null;

  if (variant === "mobile") {
    return (
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
        <Grid container spacing={1}>
          <Grid item xs={4}>
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
                }}
              >
                1X
              </Typography>
              <BettingOption
                game={game}
                betType="Double Chance"
                selection="1 or X"
                odds={homeOrDraw}
                label="1X"
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
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
                }}
              >
                X2
              </Typography>
              <BettingOption
                game={game}
                betType="Double Chance"
                selection="X or 2"
                odds={drawOrAway}
                label="X2"
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
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
                }}
              >
                12
              </Typography>
              <BettingOption
                game={game}
                betType="Double Chance"
                selection="1 or 2"
                odds={homeOrAway}
                label="12"
                onAddToBetSlip={onAddToBetSlip}
                isSelectionInBetSlip={isSelectionInBetSlip}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
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
            game={game}
            betType="Double Chance"
            selection="1 or X"
            odds={homeOrDraw}
            label="1X"
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
            X2
          </Typography>
          <BettingOption
            game={game}
            betType="Double Chance"
            selection="X or 2"
            odds={drawOrAway}
            label="X2"
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
            12
          </Typography>
          <BettingOption
            game={game}
            betType="Double Chance"
            selection="1 or 2"
            odds={homeOrAway}
            label="12"
            onAddToBetSlip={onAddToBetSlip}
            isSelectionInBetSlip={isSelectionInBetSlip}
          />
        </Box>
      </Stack>
    </Box>
  );
};

