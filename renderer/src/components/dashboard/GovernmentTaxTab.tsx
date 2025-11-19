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
  Grid,
  Divider,
} from "@mui/material";
import {
  AccountBalance as GovernmentIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { governmentTaxService, PendingGovernmentTax, GovernmentTaxPayment } from "../../services/governmentTaxService";
import dayjs from "dayjs";

interface GovernmentTaxTabProps {
  formatCurrency: (amount: number) => string;
}

export const GovernmentTaxTab: React.FC<GovernmentTaxTabProps> = ({
  formatCurrency,
}) => {
  const [pendingTaxes, setPendingTaxes] = useState<PendingGovernmentTax | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<GovernmentTaxPayment[]>([]);
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
      const history = await governmentTaxService.getPaymentHistory(itemsPerPage, offset);
      setPaymentHistory(history.payments);
      setHistoryTotal(history.pagination.total);
    } catch (err: any) {
      setError(err.message || "Failed to load payment history");
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
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
      await governmentTaxService.recordTaxPayment({
        paymentDate: paymentForm.paymentDate,
        amount: parseFloat(paymentForm.amount),
        reference: paymentForm.reference || undefined,
        notes: paymentForm.notes || undefined,
      });

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Pending Taxes Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)",
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
                        {dayjs(pendingTaxes.lastPaymentDate).format("MMM D, YYYY")}
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
                <Typography color="text.secondary">No pending taxes data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment History Card */}
        <Grid item xs={12} md={6}>
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
                          <TableCell align="right" fontWeight="bold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            {payment.reference || "-"}
                          </TableCell>
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
        </Grid>

        {/* Full Width Payment History Table */}
        <Grid item xs={12}>
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
                          <TableCell align="right" fontWeight="bold">
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
        </Grid>
      </Grid>

      {/* Payment Modal */}
      <Dialog
        open={isPaymentModalOpen}
        onClose={() => !isSubmitting && setIsPaymentModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <PaymentIcon />
            <Typography variant="h6">Record Government Tax Payment</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {pendingTaxes && (
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2" fontWeight="bold">
                  Pending Amount: {formatCurrency(pendingTaxes.pendingTaxAmount)}
                </Typography>
                <Typography variant="caption">
                  You can pay up to this amount. Payment will cover taxes from payouts completed
                  {pendingTaxes.lastPaymentDate
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
                pendingTaxes &&
                `Maximum: ${formatCurrency(pendingTaxes.pendingTaxAmount)}`
              }
              inputProps={{ min: 0, step: 0.01 }}
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
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setIsPaymentModalOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPayment}
            variant="contained"
            disabled={isSubmitting || !paymentForm.amount || !paymentForm.paymentDate}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <PaymentIcon />}
          >
            {isSubmitting ? "Recording..." : "Record Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

