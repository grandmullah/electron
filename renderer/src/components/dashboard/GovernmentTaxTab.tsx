import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Pagination,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  AccountBalance as GovernmentIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  governmentTaxService,
  PendingGovernmentTax,
  GovernmentTaxPayment,
  GovernmentTaxPaymentRequest,
} from "../../services/governmentTaxService";
import dayjs from "dayjs";

interface GovernmentTaxTabProps {
  formatCurrency: (amount: number) => string;
}

export const GovernmentTaxTab: React.FC<GovernmentTaxTabProps> = ({
  formatCurrency,
}) => {
  const [pendingTaxes, setPendingTaxes] = useState<PendingGovernmentTax | null>(
    null
  );
  const [paymentHistory, setPaymentHistory] = useState<GovernmentTaxPayment[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: dayjs().format("YYYY-MM-DD"),
    amount: "",
    reference: "",
    notes: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const itemsPerPage = 10;

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pending, history] = await Promise.all([
        governmentTaxService.getPendingTaxes(),
        governmentTaxService.getPaymentHistory(itemsPerPage, 0),
      ]);
      setPendingTaxes(pending);
      setPaymentHistory(history.payments);
      setHistoryTotal(history.pagination.total);
    } catch (err: any) {
      setError(err.message || "Failed to load government tax data");
      console.error("Error loading government tax data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load payment history for specific page
  const loadPaymentHistory = async (page: number) => {
    try {
      const offset = (page - 1) * itemsPerPage;
      const history = await governmentTaxService.getPaymentHistory(
        itemsPerPage,
        offset
      );
      setPaymentHistory(history.payments);
      setHistoryTotal(history.pagination.total);
    } catch (err: any) {
      setError(err.message || "Failed to load payment history");
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    loadPaymentHistory(page);
  };

  // Handle payment form submission
  const handleSubmitPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    if (!paymentForm.paymentDate) {
      setError("Please select a payment date");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: GovernmentTaxPaymentRequest = {
        paymentDate: paymentForm.paymentDate,
        amount: parseFloat(paymentForm.amount),
      };

      if (paymentForm.reference.trim()) {
        payload.reference = paymentForm.reference.trim();
      }

      if (paymentForm.notes.trim()) {
        payload.notes = paymentForm.notes.trim();
      }

      await governmentTaxService.recordTaxPayment(payload);

      setSuccess("Government tax payment recorded successfully!");
      setIsPaymentModalOpen(false);
      setPaymentForm({
        paymentDate: dayjs().format("YYYY-MM-DD"),
        amount: "",
        reference: "",
        notes: "",
      });

      // Reload data
      await loadData();
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to record tax payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(historyTotal / itemsPerPage);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
        gap={3}
        mb={3}
      >
        {/* Pending Taxes Card */}
        <Card
          sx={{
            background:
              "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)",
            border: "1px solid rgba(255, 193, 7, 0.3)",
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <GovernmentIcon sx={{ color: "#ff9800", fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold">
                Pending Taxes
              </Typography>
            </Stack>

            {pendingTaxes ? (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Amount to Pay
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {formatCurrency(pendingTaxes.pendingTaxAmount)}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Tax Collected (All Time)
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(pendingTaxes.totalTaxCollected)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Tax Paid (All Time)
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(pendingTaxes.totalTaxPaid)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Eligible Payouts Count
                  </Typography>
                  <Typography variant="h6">
                    {pendingTaxes.eligiblePayoutsCount}
                  </Typography>
                </Box>

                {pendingTaxes.lastPaymentDate && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Payment Date
                    </Typography>
                    <Typography variant="body1">
                      {dayjs(pendingTaxes.lastPaymentDate).format(
                        "MMM D, YYYY"
                      )}
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<PaymentIcon />}
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={pendingTaxes.pendingTaxAmount === 0}
                  sx={{ mt: 2 }}
                >
                  Record Payment
                </Button>

                {pendingTaxes.pendingTaxAmount === 0 && (
                  <Chip
                    icon={<CheckIcon />}
                    label="All taxes paid"
                    color="success"
                    sx={{ mt: 1 }}
                  />
                )}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                No pending taxes data available
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Payment History Card */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <HistoryIcon sx={{ color: "#2196f3", fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold">
                Payment History
              </Typography>
            </Stack>

            {paymentHistory.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Reference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {dayjs(payment.paymentDate).format("MMM D, YYYY")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{payment.reference || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={3}>
                No payment history available
              </Typography>
            )}

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Full Width Payment History Table */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <HistoryIcon sx={{ color: "#2196f3", fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold">
            Detailed Payment History
          </Typography>
        </Stack>

        {paymentHistory.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Payment Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Paid By</TableCell>
                    <TableCell>Recorded At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        {dayjs(payment.paymentDate).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.reference || "-"}</TableCell>
                      <TableCell>{payment.notes || "-"}</TableCell>
                      <TableCell>{payment.paidBy || "-"}</TableCell>
                      <TableCell>
                        {dayjs(payment.createdAt).format("MMM D, YYYY HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        ) : (
          <Box textAlign="center" py={4}>
            <InfoIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No payment history available
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Record your first government tax payment to see it here
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Payment Modal */}
      <Dialog
        open={isPaymentModalOpen}
        onClose={() => !isSubmitting && setIsPaymentModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background:
              "linear-gradient(135deg, rgba(26, 38, 66, 0.95) 0%, rgba(11, 9, 32, 0.98) 100%)",
            border: "1px solid rgba(103, 119, 239, 0.4)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            borderRadius: 3,
            color: "rgba(255,255,255,0.9)",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            mb: 1,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(33, 150, 243, 0.2))",
                border: "1px solid rgba(103, 119, 239, 0.4)",
              }}
            >
              <PaymentIcon sx={{ color: "#66bb6a" }} />
            </Box>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.95)" }}>
              Record Government Tax Payment
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {pendingTaxes && (
              <Alert
                severity="info"
                icon={<InfoIcon />}
                sx={{
                  backgroundColor: "rgba(33, 150, 243, 0.08)",
                  color: "rgba(255,255,255,0.9)",
                  "& .MuiAlert-icon": { color: "#64b5f6" },
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Pending Amount:{" "}
                  {formatCurrency(pendingTaxes?.pendingTaxAmount ?? 0)}
                </Typography>
                <Typography variant="caption">
                  You can pay up to this amount. Payment will cover taxes from
                  payouts completed
                  {pendingTaxes?.lastPaymentDate
                    ? ` after ${dayjs(pendingTaxes.lastPaymentDate).format("MMM D, YYYY")}`
                    : " from all completed payouts"}
                  .
                </Typography>
              </Alert>
            )}

            <TextField
              label="Payment Date"
              type="date"
              value={paymentForm.paymentDate}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 2,
                },
                "& .MuiInputBase-input": { color: "rgba(255,255,255,0.9)" },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />

            <TextField
              label="Amount"
              type="number"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amount: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              helperText={
                pendingTaxes
                  ? `Maximum: ${formatCurrency(pendingTaxes.pendingTaxAmount)}`
                  : undefined
              }
              inputProps={{ min: 0, step: 0.01 }}
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 2,
                },
                "& .MuiInputBase-input": { color: "rgba(255,255,255,0.9)" },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiFormHelperText-root": {
                  color: "rgba(255,255,255,0.6)",
                },
              }}
            />

            <TextField
              label="Reference (Optional)"
              value={paymentForm.reference}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, reference: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              placeholder="e.g., Receipt number, Transaction ID"
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 2,
                },
                "& .MuiInputBase-input": { color: "rgba(255,255,255,0.9)" },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />

            <TextField
              label="Notes (Optional)"
              value={paymentForm.notes}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, notes: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              multiline
              rows={3}
              placeholder="Additional notes about this payment"
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 2,
                },
                "& .MuiInputBase-input": { color: "rgba(255,255,255,0.9)" },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.02)",
          }}
        >
          <Button
            onClick={() => setIsPaymentModalOpen(false)}
            disabled={isSubmitting}
            sx={{
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.2)",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.4)",
                color: "rgba(255,255,255,0.95)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPayment}
            variant="contained"
            disabled={
              isSubmitting || !paymentForm.amount || !paymentForm.paymentDate
            }
            startIcon={
              isSubmitting ? <CircularProgress size={20} /> : <PaymentIcon />
            }
            sx={{
              background:
                "linear-gradient(135deg, rgba(102, 187, 106, 0.9), rgba(76, 175, 80, 0.95))",
              color: "#fff",
              px: 3,
              boxShadow: "0 10px 25px rgba(76, 175, 80, 0.35)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(102, 187, 106, 1), rgba(56, 142, 60, 1))",
                boxShadow: "0 12px 28px rgba(56, 142, 60, 0.45)",
              },
              "&.Mui-disabled": {
                color: "rgba(255,255,255,0.5)",
              },
            }}
          >
            {isSubmitting ? "Recording..." : "Record Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
