import React from "react";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { EmptyState } from "./shared/EmptyState";
import { PayoutStatsCard } from "./shared/PayoutStatsCard";
import { CompletePayoutModal } from "./shared/CompletePayoutModal";
import { usePayoutStats } from "../../hooks/usePayoutStats";
import { usePayoutSummary } from "../../hooks/usePayoutSummary";
import { PendingPayout } from "../../services/pendingPayoutsService";
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  FileDownload as ExportIcon,
  CheckCircle as CheckIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
} from "@mui/icons-material";

interface PayoutTabProps {
  pendingPayouts: PendingPayout[];
  totalPayouts: number;
  isLoadingPayouts: boolean;
  payoutError: string | null;
  validatingPayouts: Set<string>;
  payoutValidationResults: Map<string, boolean>;
  isExportingPayouts: boolean;
  completingPayouts: Set<string>;
  onLoadPendingPayouts: () => void;
  onValidatePayoutForBet: (payout: PendingPayout) => void;
  onCompletePayout: (payoutId: string, notes?: string) => Promise<any>;
  onExportPayoutsToExcel: () => void;
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

export const PayoutTab: React.FC<PayoutTabProps> = ({
  pendingPayouts,
  totalPayouts,
  isLoadingPayouts,
  payoutError,
  validatingPayouts,
  payoutValidationResults,
  isExportingPayouts,
  completingPayouts,
  onLoadPendingPayouts,
  onValidatePayoutForBet,
  onCompletePayout,
  onExportPayoutsToExcel,
  onNavigate,
}) => {
  // Load payout statistics
  const { payoutStats, isLoadingStats, statsError, loadPayoutStats } =
    usePayoutStats();

  // Load payout summary
  const {
    payoutSummary,
    isLoadingSummary,
    summaryError,
    loadPayoutSummary,
    formatCurrency,
    getTrendDirection,
  } = usePayoutSummary();

  // Load stats when component mounts
  React.useEffect(() => {
    loadPayoutStats();
    loadPayoutSummary();
  }, [loadPayoutStats, loadPayoutSummary]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPayout, setSelectedPayout] =
    React.useState<PendingPayout | null>(null);

  // Handle complete payout
  const handleCompletePayout = (payout: PendingPayout) => {
    setSelectedPayout(payout);
    setIsModalOpen(true);
  };

  // Handle modal confirmation
  const handleModalConfirm = async (notes: string) => {
    if (!selectedPayout) return;

    try {
      await onCompletePayout(selectedPayout.id, notes);
      setIsModalOpen(false);
      setSelectedPayout(null);
    } catch (error: any) {
      console.error("Failed to complete payout:", error);
      // Error handling is done in the hook
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPayout(null);
  };
  if (isLoadingPayouts) {
    return <LoadingState message="Loading pending payouts..." />;
  }

  if (payoutError) {
    return (
      <ErrorState
        title="Error Loading Payouts"
        message={payoutError}
        onRetry={onLoadPendingPayouts}
      />
    );
  }

  if (totalPayouts === 0) {
    return (
      <EmptyState
        icon="💰"
        title="No Payouts Available"
        message="No pending payouts are currently available."
      />
    );
  }

  const totalPayoutAmount = pendingPayouts.reduce(
    (sum, payout) => sum + payout.amount,
    0
  );

  return (
    <Box>
      {/* Section Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "rgba(26, 29, 41, 0.8)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "white",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <MoneyIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Payout Management
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                Process payouts for winning bets
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={
              isExportingPayouts ? (
                <CircularProgress size={16} />
              ) : (
                <ExportIcon />
              )
            }
            onClick={onExportPayoutsToExcel}
            disabled={isExportingPayouts || totalPayouts === 0}
          >
            {isExportingPayouts ? "Exporting..." : "Export Excel"}
          </Button>
        </Box>
      </Paper>

      {/* Payout Summary Section */}
      {isLoadingSummary ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <LoadingState message="Loading payout summary..." size="small" />
        </Paper>
      ) : summaryError ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <ErrorState
            title="Error Loading Summary"
            message={summaryError}
            onRetry={loadPayoutSummary}
            retryText="Retry"
          />
        </Paper>
      ) : payoutSummary ? (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 4,
            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            color: "white",
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
          <Typography variant="h5" gutterBottom fontWeight="bold">
            📊 Payout Summary
          </Typography>
          <Box display="flex" gap={3} flexWrap="wrap">
            {/* Today's Stats */}
            <Paper
              sx={{
                p: 2,
                flex: 1,
                minWidth: 200,
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 3,
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow:
                    "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                },
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Today
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Payouts:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {payoutSummary.today.totalPayouts}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Amount:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(payoutSummary.today.totalAmount)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Completed:</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="success.main"
                >
                  {payoutSummary.today.completedPayouts}
                </Typography>
              </Box>
            </Paper>

            {/* This Week's Stats */}
            <Paper
              sx={{
                p: 2,
                flex: 1,
                minWidth: 200,
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 3,
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow:
                    "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                },
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                This Week
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Payouts:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {payoutSummary.thisWeek.totalPayouts}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Amount:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(payoutSummary.thisWeek.totalAmount)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Completed:</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="success.main"
                >
                  {payoutSummary.thisWeek.completedPayouts}
                </Typography>
              </Box>
            </Paper>

            {/* This Month's Stats */}
            <Paper
              sx={{
                p: 2,
                flex: 1,
                minWidth: 200,
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 3,
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow:
                    "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                },
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                This Month
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Payouts:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {payoutSummary.thisMonth.totalPayouts}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Amount:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(payoutSummary.thisMonth.totalAmount)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Completed:</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="success.main"
                >
                  {payoutSummary.thisMonth.completedPayouts}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Paper>
      ) : null}

      {/* Payout Statistics Section */}
      {isLoadingStats ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <LoadingState message="Loading payout statistics..." size="small" />
        </Paper>
      ) : statsError ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <ErrorState
            title="Error Loading Statistics"
            message={statsError}
            onRetry={loadPayoutStats}
            retryText="Retry"
          />
        </Paper>
      ) : payoutStats ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <PayoutStatsCard stats={payoutStats} />
        </Paper>
      ) : null}

      {/* Summary Cards */}
      <Box display="flex" gap={3} mb={3}>
        <Paper
          sx={{
            p: 3,
            flex: 1,
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 3,
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            color: "white",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(156, 39, 176, 0.8) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🎉
            </Box>
            <Box>
              <Typography
                sx={{ color: "rgba(255,255,255,0.7)" }}
                variant="body2"
                gutterBottom
              >
                Pending Payouts
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                {totalPayouts}
              </Typography>
            </Box>
          </Box>
        </Paper>
        <Paper
          sx={{
            p: 3,
            flex: 1,
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 3,
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            color: "white",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(76, 175, 80, 0.8) 0%, rgba(46, 125, 50, 0.8) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              💰
            </Box>
            <Box>
              <Typography
                sx={{ color: "rgba(255,255,255,0.7)" }}
                variant="body2"
                gutterBottom
              >
                Total Payout Amount
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                SSP {totalPayoutAmount.toFixed(2)}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)" }}
                variant="body2"
              >
                Ready for processing
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Payouts Table */}
      <Paper
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
        <TableContainer>
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
                  background: "rgba(255, 255, 255, 0.08)",
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
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Payout ID
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Ticket ID
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Bet ID
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Amount
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Payment Method
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Reference
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Created
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingPayouts.map((payout) => {
                const payoutId = payout.id;
                const isValidating = validatingPayouts.has(payoutId);
                const validationResult = payoutValidationResults.get(payoutId);

                return (
                  <TableRow
                    key={payoutId}
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
                      <Typography
                        variant="body2"
                        title={payoutId}
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {payoutId.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {payout.ticketId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        title={payout.betId}
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {payout.betId.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {payout.currency} {payout.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {payout.paymentMethod}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {payout.reference}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payout.status}
                        size="small"
                        sx={{
                          background:
                            payout.status === "pending"
                              ? "rgba(255, 152, 0, 0.2)"
                              : payout.status === "completed"
                                ? "rgba(76, 175, 80, 0.2)"
                                : payout.status === "cancelled"
                                  ? "rgba(158, 158, 158, 0.2)"
                                  : "rgba(244, 67, 54, 0.2)",
                          backdropFilter: "blur(10px)",
                          color:
                            payout.status === "pending"
                              ? "#ff9800"
                              : payout.status === "completed"
                                ? "#4caf50"
                                : payout.status === "cancelled"
                                  ? "#9e9e9e"
                                  : "#f44336",
                          border:
                            payout.status === "pending"
                              ? "1px solid rgba(255, 152, 0, 0.3)"
                              : payout.status === "completed"
                                ? "1px solid rgba(76, 175, 80, 0.3)"
                                : payout.status === "cancelled"
                                  ? "1px solid rgba(158, 158, 158, 0.3)"
                                  : "1px solid rgba(244, 67, 54, 0.3)",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          fontWeight: 500,
                        }}
                        icon={
                          payout.status === "pending" ? (
                            <span>⏳</span>
                          ) : payout.status === "completed" ? (
                            <span>✅</span>
                          ) : payout.status === "cancelled" ? (
                            <span>❌</span>
                          ) : (
                            <span>⚠️</span>
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {isValidating ? (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled
                            startIcon={<CircularProgress size={16} />}
                            sx={{
                              color: "rgba(255,255,255,0.6)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              background: "rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            Validating...
                          </Button>
                        ) : validationResult === true ? (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleCompletePayout(payout)}
                              disabled={completingPayouts.has(payoutId)}
                              startIcon={
                                completingPayouts.has(payoutId) ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <CheckIcon />
                                )
                              }
                              sx={{
                                background: "rgba(76, 175, 80, 0.8)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(76, 175, 80, 0.3)",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "rgba(76, 175, 80, 0.9)",
                                  transform: "translateY(-1px)",
                                  boxShadow:
                                    "0 4px 12px rgba(76, 175, 80, 0.4)",
                                },
                                transition: "all 0.3s ease",
                              }}
                            >
                              {completingPayouts.has(payoutId)
                                ? "Completing..."
                                : "Complete"}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => onNavigate("history")}
                              startIcon={<ViewIcon />}
                              sx={{
                                color: "rgba(255,255,255,0.8)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                background: "rgba(255, 255, 255, 0.05)",
                                backdropFilter: "blur(10px)",
                                "&:hover": {
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                },
                              }}
                            >
                              History
                            </Button>
                          </>
                        ) : validationResult === false ? (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled
                            sx={{
                              color: "rgba(244, 67, 54, 0.6)",
                              border: "1px solid rgba(244, 67, 54, 0.2)",
                              background: "rgba(244, 67, 54, 0.05)",
                            }}
                          >
                            Cannot Process
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onValidatePayoutForBet(payout)}
                            sx={{
                              color: "#ff9800",
                              border: "1px solid rgba(255, 152, 0, 0.3)",
                              background: "rgba(255, 152, 0, 0.1)",
                              backdropFilter: "blur(10px)",
                              "&:hover": {
                                backgroundColor: "rgba(255, 152, 0, 0.2)",
                                border: "1px solid rgba(255, 152, 0, 0.4)",
                              },
                            }}
                          >
                            Validate
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Complete Payout Modal */}
      {selectedPayout && (
        <CompletePayoutModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          payoutId={selectedPayout.id}
          ticketId={selectedPayout.ticketId}
          amount={selectedPayout.amount}
          currency={selectedPayout.currency}
          isCompleting={completingPayouts.has(selectedPayout.id)}
        />
      )}
    </Box>
  );
};
