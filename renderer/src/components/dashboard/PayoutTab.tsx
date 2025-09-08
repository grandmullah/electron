import React from "react";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { EmptyState } from "./shared/EmptyState";
import { PayoutStatsCard } from "./shared/PayoutStatsCard";
import { CompletePayoutModal } from "./shared/CompletePayoutModal";
import { usePayoutStats } from "../../hooks/usePayoutStats";
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

  // Load stats when component mounts
  React.useEffect(() => {
    loadPayoutStats();
  }, [loadPayoutStats]);

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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <MoneyIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Payout Management
              </Typography>
              <Typography color="text.secondary">
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
        <Paper sx={{ p: 3, flex: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🎉
            </Box>
            <Box>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Pending Payouts
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {totalPayouts}
              </Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              💰
            </Box>
            <Box>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Payout Amount
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                SSP {totalPayoutAmount.toFixed(2)}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Ready for processing
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Payouts Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payout ID</TableCell>
                <TableCell>Ticket ID</TableCell>
                <TableCell>Bet ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingPayouts.map((payout) => {
                const payoutId = payout.id;
                const isValidating = validatingPayouts.has(payoutId);
                const validationResult = payoutValidationResults.get(payoutId);

                return (
                  <TableRow key={payoutId} hover>
                    <TableCell>
                      <Typography variant="body2" title={payoutId}>
                        {payoutId.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{payout.ticketId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" title={payout.betId}>
                        {payout.betId.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {payout.currency} {payout.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payout.paymentMethod}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payout.reference}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payout.status}
                        color={
                          payout.status === "pending"
                            ? "warning"
                            : payout.status === "completed"
                              ? "success"
                              : payout.status === "cancelled"
                                ? "default"
                                : "error"
                        }
                        size="small"
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
                      <Typography variant="body2">
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
                          >
                            Validating...
                          </Button>
                        ) : validationResult === true ? (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleCompletePayout(payout)}
                              disabled={completingPayouts.has(payoutId)}
                              startIcon={
                                completingPayouts.has(payoutId) ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <CheckIcon />
                                )
                              }
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
                            >
                              History
                            </Button>
                          </>
                        ) : validationResult === false ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled
                          >
                            Cannot Process
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => onValidatePayoutForBet(payout)}
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
