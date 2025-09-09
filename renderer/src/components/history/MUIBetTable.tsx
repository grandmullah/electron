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
  Button,
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
    case "accepted":
      return "default";
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
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
        border: "1px solid #2a2d3a",
        boxShadow:
          "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <Table
        sx={{
          "& .MuiTableCell-root": {
            color: "rgba(255,255,255,0.8)",
            borderColor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              background:
                "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
              borderBottom: "2px solid rgba(255,255,255,0.1)",
            }}
          >
            <TableCell
              sx={{
                color: "rgba(255,255,255,1)",
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Bet ID
            </TableCell>
            <TableCell
              sx={{
                color: "rgba(255,255,255,1)",
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Type
            </TableCell>
            <TableCell
              sx={{
                color: "rgba(255,255,255,1)",
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Selections
            </TableCell>
            <TableCell
              sx={{
                color: "rgba(255,255,255,1)",
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Stake
            </TableCell>
            <TableCell
              sx={{
                color: "rgba(255,255,255,1)",
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Odds
            </TableCell>
            <TableCell
              sx={{
                color: "rgba(255,255,255,1)",
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Potential Win
            </TableCell>
            <TableCell
              sx={{
                color: "rgba(255,255,255,1)",
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Status
            </TableCell>
            <TableCell
              sx={{
                color: "rgba(255,255,255,1)",
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Date
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: "rgba(255,255,255,1)",
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bets.map((bet) => (
            <TableRow
              key={bet.id}
              hover
              sx={{
                backgroundColor: "rgba(255,255,255,0.02)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                },
                "&:nth-of-type(even)": {
                  backgroundColor: "rgba(255,255,255,0.01)",
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
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {bet.id.substring(0, 8)}...
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
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
                  sx={{
                    backgroundColor:
                      bet.betType === "single"
                        ? "rgba(102, 126, 234, 0.2)"
                        : "rgba(156, 39, 176, 0.2)",
                    color: bet.betType === "single" ? "#667eea" : "#9c27b0",
                    borderColor:
                      bet.betType === "single" ? "#667eea" : "#9c27b0",
                  }}
                />
              </TableCell>

              <TableCell>
                <Stack spacing={0.5}>
                  {bet.selections.map((selection, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {selection.homeTeam}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        vs {selection.awayTeam}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCoins color="primary" fontSize="small" />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {formatCurrency(bet.totalStake, "SSP")}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconTrendingUp color="success" fontSize="small" />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {bet.selections[0]?.odds?.toFixed(2) || "N/A"}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconTrophy color="warning" fontSize="small" />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
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
                  sx={{
                    ...(bet.status.toLowerCase() === "accepted" && {
                      backgroundColor: "white",
                      color: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(0,0,0,0.2)",
                      "& .MuiChip-icon": {
                        color: "rgba(0,0,0,0.6)",
                      },
                    }),
                  }}
                />
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCalendar color="action" fontSize="small" />
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {formatDate(bet.createdAt)}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell align="center">
                <Box display="flex" gap={1} justifyContent="center">
                  <Tooltip title="View Details">
                    <Button
                      size="small"
                      onClick={() => onView(bet)}
                      startIcon={<IconEye />}
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        minWidth: "auto",
                        px: 1,
                        py: 0.5,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,1)",
                        },
                      }}
                    >
                      View
                    </Button>
                  </Tooltip>

                  <Tooltip title="Print Ticket">
                    <Button
                      size="small"
                      onClick={() => onPrint(bet)}
                      startIcon={<IconPrinter />}
                      sx={{
                        color: "#9c27b0",
                        minWidth: "auto",
                        px: 1,
                        py: 0.5,
                        "&:hover": {
                          backgroundColor: "rgba(156, 39, 176, 0.1)",
                          color: "#9c27b0",
                        },
                      }}
                    >
                      Print
                    </Button>
                  </Tooltip>

                  {bet.status === "won" && (
                    <Tooltip title="Process Payout">
                      <Button
                        size="small"
                        onClick={() => onPayout(bet)}
                        startIcon={<IconMoneybag />}
                        sx={{
                          color: "#4caf50",
                          minWidth: "auto",
                          px: 1,
                          py: 0.5,
                          "&:hover": {
                            backgroundColor: "rgba(76, 175, 80, 0.1)",
                            color: "#4caf50",
                          },
                        }}
                      >
                        Payout
                      </Button>
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
