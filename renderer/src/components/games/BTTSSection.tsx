import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Game } from "../../services/gamesService";
import { BettingOption } from "./BettingOption";

interface BTTSSectionProps {
  game: Game;
  yes?: number | string | null;
  no?: number | string | null;
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

export const BTTSSection: React.FC<BTTSSectionProps> = ({
  game,
  yes,
  no,
  onAddToBetSlip,
  isSelectionInBetSlip,
  variant = "desktop",
}) => {
  if (!yes && !no) return null;

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
          BOTH TEAMS TO SCORE
        </Typography>
        <Stack direction="row" spacing={1}>
          <Box
            sx={{
              textAlign: "center",
              py: 1.5,
              px: 2,
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 1,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              flex: 1,
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
              YES
            </Typography>
            <BettingOption
              game={game}
              betType="Both Teams To Score"
              selection="Yes"
              odds={yes}
              label="Yes"
              onAddToBetSlip={onAddToBetSlip}
              isSelectionInBetSlip={isSelectionInBetSlip}
            />
          </Box>
          <Box
            sx={{
              textAlign: "center",
              py: 1.5,
              px: 2,
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 1,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              flex: 1,
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
              NO
            </Typography>
            <BettingOption
              game={game}
              betType="Both Teams To Score"
              selection="No"
              odds={no}
              label="No"
              onAddToBetSlip={onAddToBetSlip}
              isSelectionInBetSlip={isSelectionInBetSlip}
            />
          </Box>
        </Stack>
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
            Y
          </Typography>
          <BettingOption
            game={game}
            betType="Both Teams To Score"
            selection="Yes"
            odds={yes}
            label="Yes"
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
            N
          </Typography>
          <BettingOption
            game={game}
            betType="Both Teams To Score"
            selection="No"
            odds={no}
            label="No"
            onAddToBetSlip={onAddToBetSlip}
            isSelectionInBetSlip={isSelectionInBetSlip}
          />
        </Box>
      </Stack>
    </Box>
  );
};


