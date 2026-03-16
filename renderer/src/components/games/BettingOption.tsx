import React from "react";
import { Button } from "@mui/material";
import { Game } from "../../services/gamesService";

interface BettingOptionProps {
  game: Game;
  betType: string;
  selection: string;
  odds: number | string | null | undefined;
  label: string;
  onAddToBetSlip: (
    game: Game,
    betType: string,
    selection: string,
    odds: number,
  ) => void;
  isSelectionInBetSlip: (
    gameId: string,
    betType: string,
    selection: string,
  ) => boolean;
}

export const BettingOption: React.FC<BettingOptionProps> = ({
  game,
  betType,
  selection,
  odds,
  label,
  onAddToBetSlip,
  isSelectionInBetSlip,
}) => {
  const numericOdds = typeof odds === "string" ? parseFloat(odds) : odds;
  const isClickable = !!numericOdds && !isNaN(numericOdds);
  const gameKey = game.externalId || game.id;
  const isSelected = isSelectionInBetSlip(gameKey, betType, selection);
  const reducedOdds = numericOdds;

  return (
    <Button
      variant={isSelected ? "contained" : "outlined"}
      size="small"
      disabled={!isClickable}
      onClick={(e) => {
        e.stopPropagation();
        isClickable && onAddToBetSlip(game, betType, selection, numericOdds!);
      }}
      sx={{
        minWidth: "fit-content",
        width: "100%",
        height: "auto",
        fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.65rem" },
        fontWeight: 700,
        color: "white",
        borderWidth: isSelected ? 2 : 1,
        borderColor: isClickable
          ? isSelected
            ? "#FFC107"
            : "rgba(25, 118, 210, 0.5)"
          : "rgba(255,255,255,0.3)",
        bgcolor: isSelected
          ? "#FFB300"
          : isClickable
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.02)",
        boxShadow: isSelected ? "0 0 14px rgba(255, 193, 7, 0.7)" : "none",
        padding: { xs: "6px 8px", sm: "8px 10px", md: "8px 10px" },
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: isSelected
            ? "0 0 18px rgba(255, 193, 7, 0.8)"
            : "0 4px 12px rgba(0,0,0,0.3)",
          bgcolor: isClickable
            ? isSelected
              ? "#FFA000"
              : "rgba(25, 118, 210, 0.2)"
            : "rgba(255,255,255,0.1)",
          borderColor: isClickable
            ? isSelected
              ? "#FFD54F"
              : "primary.main"
            : "rgba(255,255,255,0.3)",
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
