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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <BetsIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              Recent Bets
            </Typography>
            <Typography color="text.secondary">
              Your latest betting activity
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Bets Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bet ID</TableCell>
                <TableCell>Game</TableCell>
                <TableCell>Selection</TableCell>
                <TableCell>Stake</TableCell>
                <TableCell>Potential</TableCell>
                <TableCell>Taxes</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentBets.map((bet) => (
                <TableRow key={bet.betId || bet.id} hover>
                  <TableCell>
                    <Typography variant="body2" title={bet.betId || bet.id}>
                      {(bet.betId || bet.id).substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={
                          bet.betType === "single" ? "Single Bet" : "Multibet"
                        }
                        size="small"
                        color={
                          bet.betType === "single" ? "primary" : "secondary"
                        }
                        sx={{ mb: 1 }}
                      />
                      {bet.selections && bet.selections[0] && (
                        <Typography variant="body2" color="text.secondary">
                          {bet.selections[0].homeTeam} vs{" "}
                          {bet.selections[0].awayTeam}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {bet.selections && bet.selections[0] && (
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {bet.selections[0].selection}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bet.selections[0].odds}x
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      SSP{bet.totalStake || bet.stake}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      SSP{(bet.potentialWinnings || 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        SSP{(bet.taxAmount || 0).toFixed(2)}
                      </Typography>
                      {bet.taxPercentage && (
                        <Typography variant="caption" color="text.secondary">
                          (
                          {bet.taxPercentage > 1
                            ? bet.taxPercentage.toFixed(1)
                            : (bet.taxPercentage * 100).toFixed(1)}
                          %)
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bet.status}
                      color={getStatusColor(bet.status) as any}
                      size="small"
                      icon={getStatusIcon(bet.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
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
