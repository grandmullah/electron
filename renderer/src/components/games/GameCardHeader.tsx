import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import { Game } from "../../services/gamesService";

interface GameCardHeaderProps {
  game: Game;
  marketCount: number;
  onToggleExpanded: (gameId: string, event: React.MouseEvent) => void;
}

export const GameCardHeader: React.FC<GameCardHeaderProps> = ({
  game,
  marketCount,
  onToggleExpanded,
}) => {
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
    <>
      {/* Header Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          {formatDate(game.matchTime)} | ID: {shortId}
        </Typography>
        {marketCount > 1 && (
          <Button
            size="small"
            endIcon={<ChevronRightIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded(game.id, e);
            }}
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              minWidth: "auto",
              px: 1,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {marketCount}
          </Button>
        )}
      </Box>

      {/* Match Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          fontSize: { xs: "0.9rem", sm: "1rem" },
          color: "white",
          mb: 1,
          textTransform: "uppercase",
        }}
      >
        {game.homeTeam} vs {game.awayTeam}
      </Typography>
    </>
  );
};


