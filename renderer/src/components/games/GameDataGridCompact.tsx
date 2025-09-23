import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Game } from "../../services/gamesService";

interface GameDataGridCompactProps {
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

export const GameDataGridCompact: React.FC<GameDataGridCompactProps> = ({
  game,
  onAddToBetSlip,
  isSelectionInBetSlip,
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

  // Create rows for DataGrid
  const rows = [
    {
      id: "game-row",
      gameInfo: "match", // This will be rendered with custom formatting
      // 3-Way odds
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
      renderCell: () => (
        <Box sx={{ textAlign: "left", width: "100%" }}>
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
              {new Date(game.matchTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>

          {/* League Badge */}
          {game.league && (
            <Box
              sx={{
                flex: "0 0 auto",
                px: 1,
                py: 0.5,
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Typography
                variant="caption"
                color="rgba(255,255,255,0.8)"
                sx={{
                  fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.55rem" },
                  fontWeight: 600,
                }}
              >
                {game.league}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    // 3-Way betting columns
    {
      field: "1",
      headerName: "1",
      width: 50,
      renderCell: (params) => renderBettingCell(params.value, "3 Way", "Home"),
    },
    {
      field: "X",
      headerName: "X",
      width: 50,
      renderCell: (params) => renderBettingCell(params.value, "3 Way", "Draw"),
    },
    {
      field: "2",
      headerName: "2",
      width: 50,
      renderCell: (params) => renderBettingCell(params.value, "3 Way", "Away"),
    },
    // Double Chance columns
    {
      field: "1X",
      headerName: "1X",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "Double Chance", "Home or Draw"),
    },
    {
      field: "12",
      headerName: "12",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "Double Chance", "Home or Away"),
    },
    {
      field: "X2",
      headerName: "X2",
      width: 50,
      renderCell: (params) =>
        renderBettingCell(params.value, "Double Chance", "Draw or Away"),
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
      renderCell: (params) => renderBettingCell(params.value, "Both Teams To Score", "Yes"),
    },
    {
      field: "BTTS_No",
      headerName: "BTTS N",
      width: 50,
      renderCell: (params) => renderBettingCell(params.value, "Both Teams To Score", "No"),
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
        variant={isSelected ? "contained" : "outlined"}
        size="small"
        onClick={() => onAddToBetSlip(game, betType, selection, numericOdds)}
        sx={{
          minWidth: "fit-content",
          height: "auto",
          fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.65rem" },
          fontWeight: 600,
          color: isSelected ? "white" : "white",
          borderColor: "primary.main",
          bgcolor: isSelected ? "primary.main" : "rgba(255,255,255,0.1)",
          padding: { xs: "4px 6px", sm: "6px 8px", md: "8px 10px" },
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            bgcolor: "primary.main",
          },
        }}
      >
        {numericOdds?.toFixed(2) || "-"}
      </Button>
    );
  };

  return (
    <Card
      sx={{
        mb: 2,
        mx: "25%", // 25% margin on left and right
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        color: "white",
      }}
    >
      <CardContent sx={{ p: 3 }}>
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
              minHeight: "70px",
              backgroundColor: "transparent",
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
              backgroundColor: "transparent",
              color: "white",
            },
            "& .MuiDataGrid-cell:first-of-type": {
              justifyContent: "flex-start",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "transparent",
              borderBottom: "none",
              minHeight: "40px !important",
              color: "white",
            },
            "& .MuiDataGrid-columnHeader": {
              fontSize: "0.7rem",
              fontWeight: "bold",
              padding: "8px 12px",
              minHeight: "40px !important",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              borderRight: "none",
              borderLeft: "none",
              borderTop: "none",
              borderBottom: "none",
            },
            "& .MuiDataGrid-row": {
              minHeight: "60px !important",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.05)",
              },
            },
            "& .MuiDataGrid-main": {
              overflow: "visible",
              backgroundColor: "transparent",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: "transparent",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "transparent",
              borderTop: "none",
              color: "white",
            },
            "& .MuiDataGrid-container--top": {
              backgroundColor: "transparent",
            },
            "& .MuiDataGrid-container--bottom": {
              backgroundColor: "transparent",
            },
          }}
        />
      </CardContent>
    </Card>
  );
};
