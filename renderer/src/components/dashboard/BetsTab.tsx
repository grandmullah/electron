import React from "react";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { EmptyState } from "./shared/EmptyState";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  SportsEsports as BetsIcon,
  EmojiEvents as TrophyIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

interface BetsTabProps {
  recentBets: any[];
  isLoadingBets: boolean;
  betsError: string | null;
  onLoadRecentBets: () => void;
}

export const BetsTab: React.FC<BetsTabProps> = ({
  recentBets,
  isLoadingBets,
  betsError,
  onLoadRecentBets,
}) => {
  if (isLoadingBets) {
    return <LoadingState message="Loading recent bets..." />;
  }

  if (betsError) {
    return (
      <ErrorState
        title="Error Loading Bets"
        message={betsError}
        onRetry={onLoadRecentBets}
      />
    );
  }

  if (recentBets.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="No Recent Bets"
        message="No recent betting activity found."
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "success";
      case "lost":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return <TrophyIcon />;
      case "lost":
        return <CancelIcon />;
      case "pending":
        return <PendingIcon />;
      default:
        return <BetsIcon />;
    }
  };

  return (
    <Box>
      {/* Section Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background:
            "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <BetsIcon sx={{ fontSize: 32, color: "#667eea" }} />
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              Recent Bets
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              Your latest betting activity
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Bets Table */}
      <Paper
        sx={{
          background:
            "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <TableCell
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  Bet ID
                </TableCell>
                <TableCell
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  Game
                </TableCell>
                <TableCell
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  Selection
                </TableCell>
                <TableCell
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  Stake
                </TableCell>
                <TableCell
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  Potential
                </TableCell>
                <TableCell
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  Taxes
                </TableCell>
                <TableCell
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentBets.map((bet, index) => (
                <TableRow
                  key={bet.betId || bet.id}
                  hover
                  sx={{
                    backgroundColor:
                      index % 2 === 0
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                    <Typography
                      variant="body2"
                      title={bet.betId || bet.id}
                      sx={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      {bet.betId || bet.id
                        ? (bet.betId || bet.id).substring(0, 8) + "..."
                        : "Unknown"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                    <Box>
                      <Chip
                        label={
                          bet.betType === "single" ? "Single Bet" : "Multibet"
                        }
                        size="small"
                        color={
                          bet.betType === "single" ? "primary" : "secondary"
                        }
                        sx={{
                          mb: 1,
                          backgroundColor:
                            bet.betType === "single" ? "#667eea" : "#9c27b0",
                          color: "white",
                        }}
                      />
                      {bet.selections && bet.selections[0] && (
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          {bet.selections[0].homeTeam} vs{" "}
                          {bet.selections[0].awayTeam}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                    {bet.selections && bet.selections[0] && (
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ color: "rgba(255,255,255,0.9)" }}
                        >
                          {bet.selections[0].selection}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          {bet.selections[0].odds}x
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      SSP{bet.totalStake || bet.stake}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      SSP{(bet.potentialWinnings || 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        SSP{(bet.taxAmount || 0).toFixed(2)}
                      </Typography>
                      {bet.taxPercentage && (
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          (
                          {bet.taxPercentage > 1
                            ? bet.taxPercentage.toFixed(1)
                            : (bet.taxPercentage * 100).toFixed(1)}
                          %)
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                    <Chip
                      label={bet.status}
                      color={getStatusColor(bet.status) as any}
                      size="small"
                      icon={getStatusIcon(bet.status)}
                      sx={{
                        backgroundColor:
                          getStatusColor(bet.status) === "success"
                            ? "#4caf50"
                            : getStatusColor(bet.status) === "error"
                              ? "#f44336"
                              : getStatusColor(bet.status) === "warning"
                                ? "#ff9800"
                                : "#667eea",
                        color: "white",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {new Date(
                        bet.timestamp || (bet as any).createdAt || ""
                      ).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
