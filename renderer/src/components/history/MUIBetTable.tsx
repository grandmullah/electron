import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Visibility as IconEye,
  Print as IconPrinter,
  AttachMoney as IconMoneybag,
  EmojiEvents as IconTrophy,
  Person as IconId,
  GpsFixed as IconTarget,
  MonetizationOn as IconCoins,
  TrendingUp as IconTrendingUp,
  CalendarToday as IconCalendar,
} from "@mui/icons-material";
import { DisplayBet } from "../../types/history";

interface MUIBetTableProps {
  bets: DisplayBet[];
  onPrint: (bet: DisplayBet) => void;
  onView: (bet: DisplayBet) => void;
  onPayout: (bet: DisplayBet) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const getStatusVariant = (status: string): "filled" | "outlined" => {
  switch (status.toLowerCase()) {
    case "won":
    case "completed":
      return "filled";
    case "pending":
    case "processing":
      return "outlined";
    case "lost":
    case "cancelled":
    case "failed":
      return "filled";
    default:
      return "outlined";
  }
};

const getStatusColorScheme = (
  status: string
): "success" | "warning" | "error" | "default" => {
  switch (status.toLowerCase()) {
    case "won":
    case "completed":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "lost":
    case "cancelled":
    case "failed":
      return "error";
    default:
      return "default";
  }
};

const formatCurrency = (amount: number, currency: string): string => {
  return `${currency} ${amount.toFixed(2)}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const MUIBetTable: React.FC<MUIBetTableProps> = ({
  bets,
  onPrint,
  onView,
  onPayout,
  getStatusColor,
  getStatusIcon,
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 2, overflow: "hidden" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bet ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Selections</TableCell>
            <TableCell>Stake</TableCell>
            <TableCell>Odds</TableCell>
            <TableCell>Potential Win</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bets.map((bet) => (
            <TableRow
              key={bet.id}
              hover
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                  >
                    <IconId fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {bet.id.substring(0, 8)}...
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bet.type}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  label={bet.betType}
                  size="small"
                  color={bet.betType === "single" ? "primary" : "secondary"}
                  variant="outlined"
                />
              </TableCell>

              <TableCell>
                <Stack spacing={0.5}>
                  {bet.selections.map((selection, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {selection.homeTeam}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        vs {selection.awayTeam}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCoins color="primary" fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(bet.totalStake, "SSP")}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconTrendingUp color="success" fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    {bet.selections[0]?.odds?.toFixed(2) || "N/A"}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconTrophy color="warning" fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(bet.potentialWinnings, "SSP")}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  icon={getStatusIcon(bet.status)}
                  label={bet.status}
                  color={getStatusColorScheme(bet.status)}
                  variant={getStatusVariant(bet.status)}
                  size="small"
                />
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCalendar color="action" fontSize="small" />
                  <Typography variant="body2">
                    {formatDate(bet.createdAt)}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell align="center">
                <Box display="flex" gap={1} justifyContent="center">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => onView(bet)}
                      color="primary"
                    >
                      <IconEye fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print Ticket">
                    <IconButton
                      size="small"
                      onClick={() => onPrint(bet)}
                      color="secondary"
                    >
                      <IconPrinter fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {bet.status === "won" && (
                    <Tooltip title="Process Payout">
                      <IconButton
                        size="small"
                        onClick={() => onPayout(bet)}
                        color="success"
                      >
                        <IconMoneybag fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
