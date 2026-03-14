import React, { useState, useMemo } from "react";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { EmptyState } from "./shared/EmptyState";
import { DisplayBet } from "../../types/history";
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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  SportsEsports as BetsIcon,
  EmojiEvents as TrophyIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

export type BetStatusFilter = "all" | "won" | "lost" | "pending";
export type BetPeriodFilter = number | null; // null = all time, number = last N days

interface BetsTabProps {
  recentBets: DisplayBet[];
  isLoadingBets: boolean;
  betsError: string | null;
  onLoadRecentBets: (options?: { days?: number | null }) => void;
}

export const BetsTab: React.FC<BetsTabProps> = ({
  recentBets,
  isLoadingBets,
  betsError,
  onLoadRecentBets,
}) => {
  const [statusFilter, setStatusFilter] = useState<BetStatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<BetPeriodFilter>(null);

  const filteredBets = useMemo(() => {
    let list = recentBets;

    if (statusFilter !== "all") {
      list = list.filter((bet) => (bet.status || (bet as any).result || "").toLowerCase() === statusFilter);
    }

    if (periodFilter != null && periodFilter > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - periodFilter);
      list = list.filter((bet) => {
        const ts = bet.timestamp || (bet as any).createdAt;
        if (!ts) return false;
        return new Date(ts).getTime() >= cutoff.getTime();
      });
    }

    return list;
  }, [recentBets, statusFilter, periodFilter]);

  const handlePeriodChange = (days: number | "") => {
    const value = days === "" ? null : (days as number);
    setPeriodFilter(value);
    onLoadRecentBets({ days: value ?? undefined });
  };

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

  const showFilteredEmpty = filteredBets.length === 0 && recentBets.length > 0;

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

  // Helper function to safely extract odds value
  const getOddsValue = (odds: any): string => {
    if (typeof odds === "number") {
      return `${odds}x`;
    } else if (odds && typeof odds === "object") {
      return `${odds.decimal || odds.multiplier || "N/A"}x`;
    }
    return "N/A";
  };

  return (
    <Box>
      {/* Section Header with filters */}
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
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
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

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                Status:
              </Typography>
              {(["all", "won", "lost", "pending"] as const).map((status) => (
                <Chip
                  key={status}
                  label={status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                  onClick={() => setStatusFilter(status)}
                  size="small"
                  sx={{
                    backgroundColor: statusFilter === status ? "#667eea" : "rgba(255,255,255,0.1)",
                    color: "white",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: statusFilter === status ? "#5a6fd6" : "rgba(255,255,255,0.2)" },
                  }}
                />
              ))}
            </Stack>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: "rgba(255,255,255,0.8)" }}>Period</InputLabel>
              <Select
                value={periodFilter ?? ""}
                label="Period"
                onChange={(e) => handlePeriodChange(e.target.value === "" ? "" : Number(e.target.value))}
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
                }}
              >
                <MenuItem value="">All time</MenuItem>
                <MenuItem value={1}>Last 1 day</MenuItem>
                <MenuItem value={5}>Last 5 days</MenuItem>
                <MenuItem value={7}>Last 7 days</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Paper>

      {showFilteredEmpty && (
        <Paper sx={{ p: 3, mb: 3, textAlign: "center", backgroundColor: "rgba(255,255,255,0.05)" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.8)" }}>
            No bets match the current filters. Try changing status or period.
          </Typography>
        </Paper>
      )}

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
              {filteredBets.map((bet, index) => (
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
                      {bet.selections &&
                        bet.selections.length > 0 &&
                        bet.selections[0] && (
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
                    {bet.selections &&
                      bet.selections.length > 0 &&
                      bet.selections[0] && (
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
                            {getOddsValue(bet.selections[0].odds)}
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
