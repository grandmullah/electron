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
  CheckCircle as IconCheckCircle,
  Pending as IconPending,
  Cancel as IconCancel,
  Error as IconError,
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

const getPaymentStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case "paid":
      return <IconCheckCircle fontSize="small" />;
    case "pending":
      return <IconPending fontSize="small" />;
    case "no_payout":
      return <IconCancel fontSize="small" />;
    case "no_payment_needed":
      return <IconCancel fontSize="small" />;
    case "failed":
      return <IconError fontSize="small" />;
    case "cancelled":
      return <IconCancel fontSize="small" />;
    default:
      return <IconPending fontSize="small" />;
  }
};

const getPaymentStatusColor = (
  status: string
): "success" | "warning" | "error" | "default" => {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "no_payout":
      return "default";
    case "no_payment_needed":
      return "default";
    case "failed":
      return "error";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const getPaymentStatusVariant = (status: string): "filled" | "outlined" => {
  switch (status) {
    case "paid":
      return "filled";
    case "pending":
      return "outlined";
    case "no_payout":
      return "outlined";
    case "no_payment_needed":
      return "outlined";
    case "failed":
      return "filled";
    case "cancelled":
      return "filled";
    default:
      return "outlined";
  }
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
        borderRadius: 4,
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow:
          "0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
        },
      }}
    >
      <Table
        sx={{
          "& .MuiTableCell-root": {
            color: "rgba(255,255,255,0.8)",
            borderColor: "rgba(255,255,255,0.1)",
            padding: "12px 8px",
            verticalAlign: "top",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            padding: "16px 8px",
            verticalAlign: "middle",
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
              },
            }}
          >
            <TableCell
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "12%",
                minWidth: "120px",
              }}
            >
              Bet ID
            </TableCell>
            <TableCell
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "8%",
                minWidth: "80px",
              }}
            >
              Type
            </TableCell>
            <TableCell
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "20%",
                minWidth: "200px",
              }}
            >
              Selections
            </TableCell>
            <TableCell
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "10%",
                minWidth: "100px",
              }}
            >
              Stake
            </TableCell>
            <TableCell
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "8%",
                minWidth: "80px",
              }}
            >
              Odds
            </TableCell>
            <TableCell
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "12%",
                minWidth: "120px",
              }}
            >
              Potential Win
            </TableCell>
            <TableCell
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "10%",
                minWidth: "100px",
              }}
            >
              Status
            </TableCell>
            <TableCell
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "15%",
                minWidth: "150px",
              }}
            >
              Payment Status
            </TableCell>
            <TableCell
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "12%",
                minWidth: "120px",
              }}
            >
              Date
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: "white !important",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                width: "15%",
                minWidth: "150px",
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
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.08)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                },
                "&:nth-of-type(even)": {
                  backgroundColor: "rgba(255,255,255,0.03)",
                },
              }}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      background:
                        "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(156, 39, 176, 0.8) 100%)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
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
                      {bet["type"]}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  label={bet.betType}
                  size="small"
                  variant="outlined"
                  sx={{
                    background:
                      bet.betType === "single"
                        ? "rgba(102, 126, 234, 0.15)"
                        : "rgba(156, 39, 176, 0.15)",
                    backdropFilter: "blur(10px)",
                    color: bet.betType === "single" ? "#667eea" : "#9c27b0",
                    border:
                      bet.betType === "single"
                        ? "1px solid rgba(102, 126, 234, 0.3)"
                        : "1px solid rgba(156, 39, 176, 0.3)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    fontWeight: 500,
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
                    {bet.betType === "multibet"
                      ? bet.selections
                          .reduce((acc, selection) => acc * selection.odds, 1)
                          .toFixed(2)
                      : bet.selections[0]?.odds?.toFixed(2) || "N/A"}
                  </Typography>
                  {bet.betType === "multibet" && (
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.6)", ml: 0.5 }}
                    >
                      ({bet.selections.length}×)
                    </Typography>
                  )}
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
                  icon={getStatusIcon(bet.status) as React.ReactElement}
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

              <TableCell sx={{ verticalAlign: "top" }}>
                {bet.paymentStatus ? (
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Chip
                      icon={
                        getPaymentStatusIcon(
                          bet.paymentStatus.status
                        ) as React.ReactElement
                      }
                      label={bet.paymentStatus.status
                        .replace("_", " ")
                        .toUpperCase()}
                      color={getPaymentStatusColor(bet.paymentStatus.status)}
                      variant={getPaymentStatusVariant(
                        bet.paymentStatus.status
                      )}
                      size="small"
                    />
                    {bet.paymentStatus.payoutAmount && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255,255,255,0.7)",
                          fontWeight: 500,
                        }}
                      >
                        {formatCurrency(bet.paymentStatus.payoutAmount, "SSP")}
                      </Typography>
                    )}
                    {bet.paymentStatus.paymentMethod && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.7rem",
                        }}
                      >
                        via {bet.paymentStatus.paymentMethod}
                      </Typography>
                    )}
                    {bet.paymentStatus.payoutId && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.65rem",
                        }}
                      >
                        ID: {bet.paymentStatus.payoutId}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    No payment info
                  </Typography>
                )}
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

              <TableCell align="center" sx={{ verticalAlign: "top" }}>
                <Box
                  display="flex"
                  gap={1}
                  justifyContent="center"
                  flexWrap="wrap"
                >
                  <Tooltip title="View Details">
                    <Button
                      size="small"
                      onClick={() => onView(bet)}
                      startIcon={<IconEye />}
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        minWidth: "auto",
                        px: 1.5,
                        py: 0.5,
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.15)",
                          color: "rgba(255,255,255,1)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
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
                        px: 1.5,
                        py: 0.5,
                        background: "rgba(156, 39, 176, 0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(156, 39, 176, 0.2)",
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "rgba(156, 39, 176, 0.2)",
                          color: "#9c27b0",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
                        },
                      }}
                    >
                      Print
                    </Button>
                  </Tooltip>

                  {bet.status === "won" &&
                    (!bet.paymentStatus ||
                      bet.paymentStatus.status !== "paid") && (
                      <Tooltip title="Process Payout">
                        <Button
                          size="small"
                          onClick={() => onPayout(bet)}
                          startIcon={<IconMoneybag />}
                          sx={{
                            color: "#4caf50",
                            minWidth: "auto",
                            px: 1.5,
                            py: 0.5,
                            background: "rgba(76, 175, 80, 0.1)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(76, 175, 80, 0.2)",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.2)",
                              color: "#4caf50",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
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
