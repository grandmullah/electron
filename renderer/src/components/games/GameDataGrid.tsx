import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography, Button } from "@mui/material";
import { Game } from "../../types/game";

interface GameDataGridProps {
  game: Game;
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
}

export const GameDataGrid: React.FC<GameDataGridProps> = ({
  game,
  onAddToBetSlip,
  isSelectionInBetSlip,
}) => {
  // Create a single row with all betting options
  const rows = [
    {
      id: "game-row",
      gameInfo: `${game.homeTeam} vs ${game.awayTeam} • ${game.league} • ${game.matchTime}`,
      // 3-Way odds (using correct API structure)
      "1": game.homeOdds || "-",
      X: game.drawOdds || "-",
      "2": game.awayOdds || "-",
      // Double Chance odds
      "1X": game.doubleChance?.homeOrDraw || "-",
      "12": game.doubleChance?.homeOrAway || "-",
      X2: game.doubleChance?.drawOrAway || "-",
      // Totals odds (most common ones)
      "O2.5": game.totals.find((t) => t.point === 2.5)?.over || "-",
      "U2.5": game.totals.find((t) => t.point === 2.5)?.under || "-",
      "O2.75": game.totals.find((t) => t.point === 2.75)?.over || "-",
      "U2.75": game.totals.find((t) => t.point === 2.75)?.under || "-",
      "O3.0": game.totals.find((t) => t.point === 3.0)?.over || "-",
      "U3.0": game.totals.find((t) => t.point === 3.0)?.under || "-",
      // BTTS odds
      BTTS_Yes: game.bothTeamsToScore?.yes || "-",
      BTTS_No: game.bothTeamsToScore?.no || "-",
    },
  ];

  const columns: GridColDef[] = [
    {
      field: "gameInfo",
      headerName: "Match",
      width: 300,
      renderCell: (params) => (
        <Box sx={{ textAlign: "left", width: "100%" }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              fontWeight: "bold",
              display: "block",
              lineHeight: 1.2,
            }}
          >
            {game.homeTeam} vs {game.awayTeam}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.6rem",
              color: "text.secondary",
              display: "block",
              lineHeight: 1.2,
            }}
          >
            {game.league} • {game.matchTime}
          </Typography>
        </Box>
      ),
    },
    // 3-Way betting columns
    {
      field: "1",
      headerName: "1",
      width: 50,
      renderCell: (params) => renderBettingCell(params.value, "1", "1"),
    },
    {
      field: "X",
      headerName: "X",
      width: 50,
      renderCell: (params) => renderBettingCell(params.value, "X", "Draw"),
    },
    {
      field: "2",
      headerName: "2",
      width: 50,
      renderCell: (params) => renderBettingCell(params.value, "2", "2"),
    },
    // Double Chance columns
    {
      field: "1X",
      headerName: "1X",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "1X", "Home or Draw"),
    },
    {
      field: "12",
      headerName: "12",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "12", "Home or Away"),
    },
    {
      field: "X2",
      headerName: "X2",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "X2", "Draw or Away"),
    },
    // Totals columns
    {
      field: "O2.5",
      headerName: "O2.5",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "Over/Under 2.5", "Over 2.5"),
    },
    {
      field: "U2.5",
      headerName: "U2.5",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "Over/Under 2.5", "Under 2.5"),
    },
    {
      field: "O2.75",
      headerName: "O2.75",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "Over/Under 2.75", "Over 2.75"),
    },
    {
      field: "U2.75",
      headerName: "U2.75",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "Over/Under 2.75", "Under 2.75"),
    },
    {
      field: "O3.0",
      headerName: "O3.0",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "Over/Under 3.0", "Over 3.0"),
    },
    {
      field: "U3.0",
      headerName: "U3.0",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "Over/Under 3.0", "Under 3.0"),
    },
    // BTTS columns
    {
      field: "BTTS_Yes",
      headerName: "BTTS Y",
      width: 50,
      renderCell: (params) => renderBettingCell(params.value, "BTTS", "Yes"),
    },
    {
      field: "BTTS_No",
      headerName: "BTTS N",
      width: 50,
      renderCell: (params) => renderBettingCell(params.value, "BTTS", "No"),
    },
  ];

  const renderBettingCell = (
    odds: string | number,
    betType: string,
    selection: string
  ) => {
    if (!odds || odds === "-") {
      return (
        <Typography
          variant="caption"
          sx={{ fontSize: "0.6rem", color: "#666666" }}
        >
          -
        </Typography>
      );
    }

    const numericOdds = typeof odds === "string" ? parseFloat(odds) : odds;
    const isSelected = isSelectionInBetSlip(game.id, betType, selection);

    return (
      <Button
        size="small"
        variant={isSelected ? "contained" : "outlined"}
        color={isSelected ? "primary" : "inherit"}
        onClick={() => onAddToBetSlip(game, betType, selection, numericOdds)}
        sx={{
          minWidth: "40px",
          width: "40px",
          height: "40px",
          fontSize: "0.7rem",
          fontWeight: "bold",
          padding: "0",
          borderRadius: "50%",
          color: isSelected ? "white" : "#ffffff",
          borderColor: isSelected ? "primary.main" : "#e0e0e0",
          backgroundColor: isSelected ? "primary.main" : "transparent",
          "&:hover": {
            backgroundColor: isSelected ? "primary.dark" : "#f5f5f5",
            borderColor: isSelected ? "primary.dark" : "#d0d0d0",
            color: isSelected ? "white" : "#333333",
          },
        }}
      >
        {numericOdds}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        mb: 1,
        backgroundColor: "#1a1d29",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        hideFooter
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        disableVirtualization
        autoHeight
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            borderRadius: "0px",
            minHeight: "60px",
            backgroundColor: "#1a1d29",
            color: "white",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
            borderRight: "none",
            borderLeft: "none",
            borderTop: "none",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1d29",
            color: "white",
          },
          "& .MuiDataGrid-cell:first-of-type": {
            justifyContent: "flex-start",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
            borderBottom: "none",
            minHeight: "40px !important",
            color: "#333333",
            borderRadius: "8px 8px 0 0",
          },
          "& .MuiDataGrid-columnHeader": {
            fontSize: "0.7rem",
            fontWeight: "bold",
            padding: "8px 12px",
            minHeight: "40px !important",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#333333",
            borderRight: "none",
            borderLeft: "none",
            borderTop: "none",
            borderBottom: "none",
          },
          "& .MuiDataGrid-row": {
            minHeight: "50px !important",
            backgroundColor: "#1a1d29",
            "&:hover": {
              backgroundColor: "#2a2d3a",
            },
          },
          "& .MuiDataGrid-main": {
            overflow: "visible",
            backgroundColor: "#1a1d29",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#1a1d29",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#f5f5f5",
            borderTop: "none",
            color: "#333333",
          },
          "& .MuiDataGrid-container--top": {
            backgroundColor: "#1a1d29",
          },
          "& .MuiDataGrid-container--bottom": {
            backgroundColor: "#1a1d29",
          },
        }}
      />
    </Box>
  );
};
