import React, { useState, useEffect } from "react";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { EmptyState } from "./shared/EmptyState";
import { TaxRevenueCard } from "./cards/TaxRevenueCard";
import { TotalRevenueCard } from "./cards/TotalRevenueCard";
import { ExpensesCard } from "./cards/ExpensesCard";
import { NetProfitCard } from "./cards/NetProfitCard";
import { PerformanceCard } from "./cards/PerformanceCard";
import { PendingBetsCard } from "./cards/PendingBetsCard";
import { FinancialSummary } from "../../services/financialSummaryService";
import excelExportService from "../../services/excelExportService";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";

interface FinancialTabProps {
  financialSummary: FinancialSummary | null;
  periodSummaries: {
    today: FinancialSummary | null;
    thisWeek: FinancialSummary | null;
    thisMonth: FinancialSummary | null;
  };
  isLoadingSummary: boolean;
  summaryError: string | null;
  isLoadingPeriods: boolean;
  periodsError: string | null;
  onRetry: () => void;
  formatCurrency: (amount: number) => string;
  getProfitMarginColor: (margin: number) => string;
  getWinRateColor: (winRate: number) => string;
  getFinancialAnalysis: (summary: FinancialSummary | null) => {
    totalRevenue: number;
    actualExpenses: number;
    netProfit: number;
    taxCollected: number;
    formattedTotalRevenue: string;
    formattedActualExpenses: string;
    formattedNetProfit: string;
    formattedTaxCollected: string;
  };
  selectedRange: number;
  onRangeChange: (days: number) => void;
}

export const FinancialTab: React.FC<FinancialTabProps> = ({
  financialSummary,
  periodSummaries,
  isLoadingSummary,
  summaryError,
  isLoadingPeriods,
  periodsError,
  onRetry,
  formatCurrency,
  getProfitMarginColor,
  getWinRateColor,
  getFinancialAnalysis,
  selectedRange,
  onRangeChange,
}) => {
  // Excel export state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportDays, setExportDays] = useState(selectedRange);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    setExportDays(selectedRange);
  }, [selectedRange]);

  const rangeOptions = [
    { label: "Last 30 days", value: 30 },
    { label: "Last 90 days", value: 90 },
    { label: "Last 180 days", value: 180 },
    { label: "Last 365 days", value: 365 },
    { label: "Last 730 days", value: 730 },
  ];

  // Handle Excel export
  const handleExportToExcel = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      // Get export data
      const exportResponse = await excelExportService.getExportSummary(
        exportDays,
        "json"
      );

      // Generate Excel file
      await excelExportService.generateExcelFile(
        exportResponse.data,
        exportDays
      );

      // Close dialog
      setExportDialogOpen(false);
    } catch (error: any) {
      console.error("Export error:", error);
      setExportError(error.message || "Failed to export data to Excel");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingSummary) {
    return <LoadingState message="Loading financial summary..." />;
  }

  if (summaryError) {
    return (
      <ErrorState
        title="Error Loading Financial Summary"
        message={summaryError}
        onRetry={onRetry}
      />
    );
  }

  if (!financialSummary) {
    return (
      <EmptyState
        icon="💰"
        title="No Financial Data Available"
        message="No financial summary data is currently available."
      />
    );
  }

  return (
    <Box>
      {/* Section Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 0,
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
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Financial Analytics
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                Comprehensive financial overview and performance metrics
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                minWidth: 180,
                "& .MuiInputBase-root": {
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 1,
                },
                "& .MuiSvgIcon-root": {
                  color: "rgba(255,255,255,0.8)",
                },
              }}
            >
              <InputLabel id="financial-range-select-label" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Range
              </InputLabel>
              <Select
                labelId="financial-range-select-label"
                value={selectedRange}
                label="Range"
                onChange={(event) => onRangeChange(Number(event.target.value))}
                sx={{
                  "& .MuiSelect-select": {
                    color: "white",
                  },
                }}
              >
                {rangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Export Button */}
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={() => setExportDialogOpen(true)}
              sx={{
                background: "linear-gradient(45deg, #4caf50, #45a049)",
                color: "white",
                fontWeight: "bold",
                px: 3,
                py: 1.5,
                borderRadius: 0,
                textTransform: "none",
                fontSize: "0.9rem",
                "&:hover": {
                  background: "linear-gradient(45deg, #45a049, #3d8b40)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Export to Excel
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Independent Financial Cards - Single Row Layout */}
      <Grid
        container
        spacing={2}
        mb={3}
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 0,
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: 0,
            "&:hover": {
              background: "rgba(255, 255, 255, 0.5)",
            },
          },
        }}
      >
        <Grid
          item
          sx={{
            minWidth: { xs: "180px", sm: "200px", md: "220px" },
            flex: "0 0 auto",
          }}
        >
          <TaxRevenueCard
            financialSummary={financialSummary}
            formatCurrency={formatCurrency}
          />
        </Grid>
        <Grid
          item
          sx={{
            minWidth: { xs: "180px", sm: "200px", md: "220px" },
            flex: "0 0 auto",
          }}
        >
          <TotalRevenueCard
            financialSummary={financialSummary}
            formatCurrency={formatCurrency}
          />
        </Grid>
        <Grid
          item
          sx={{
            minWidth: { xs: "180px", sm: "200px", md: "220px" },
            flex: "0 0 auto",
          }}
        >
          <ExpensesCard
            financialSummary={financialSummary}
            formatCurrency={formatCurrency}
          />
        </Grid>
        <Grid
          item
          sx={{
            minWidth: { xs: "180px", sm: "200px", md: "220px" },
            flex: "0 0 auto",
          }}
        >
          <NetProfitCard
            financialSummary={financialSummary}
            formatCurrency={formatCurrency}
          />
        </Grid>
        <Grid
          item
          sx={{
            minWidth: { xs: "180px", sm: "200px", md: "220px" },
            flex: "0 0 auto",
          }}
        >
          <PerformanceCard
            financialSummary={financialSummary}
            formatCurrency={formatCurrency}
          />
        </Grid>
        <Grid
          item
          sx={{
            minWidth: { xs: "180px", sm: "200px", md: "220px" },
            flex: "0 0 auto",
          }}
        >
          <PendingBetsCard
            financialSummary={financialSummary}
            formatCurrency={formatCurrency}
          />
        </Grid>
      </Grid>

      {/* Period Summary Cards */}
      <Box display="flex" gap={3} mb={3} flexWrap="wrap">
        {/* Today */}
        <Paper
          sx={{
            p: 2,
            flex: 1,
            minWidth: 200,
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 0,
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
          {periodSummaries.today ? (
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Revenue:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(periodSummaries.today.revenue.totalRevenue)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Profit:</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="success.main"
                >
                  {formatCurrency(periodSummaries.today.profit.netProfit)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Bets:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {periodSummaries.today.performance.totalBets}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              No data available
            </Typography>
          )}
        </Paper>

        {/* This Week */}
        <Paper
          sx={{
            p: 2,
            flex: 1,
            minWidth: 200,
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 0,
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
          {periodSummaries.thisWeek ? (
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Revenue:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(
                    periodSummaries.thisWeek.revenue.totalRevenue
                  )}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Profit:</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="success.main"
                >
                  {formatCurrency(periodSummaries.thisWeek.profit.netProfit)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Bets:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {periodSummaries.thisWeek.performance.totalBets}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              No data available
            </Typography>
          )}
        </Paper>

        {/* This Month */}
        <Paper
          sx={{
            p: 2,
            flex: 1,
            minWidth: 200,
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 0,
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
          {periodSummaries.thisMonth ? (
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Revenue:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(
                    periodSummaries.thisMonth.revenue.totalRevenue
                  )}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Profit:</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="success.main"
                >
                  {formatCurrency(periodSummaries.thisMonth.profit.netProfit)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Bets:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {periodSummaries.thisMonth.performance.totalBets}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              No data available
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Detailed Financial Summary */}
      <Grid container spacing={3}>
        {/* Revenue Section */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 0,
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
            <Typography variant="h5" gutterBottom fontWeight="bold">
              💰 Revenue Analysis
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Settled Revenue:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(financialSummary.revenue.settledRevenue || 0)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Stakes from Lost Bets:</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(
                    financialSummary.revenue.stakesFromLostBets || 0
                  )}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">
                  Stakes from Winning Bets:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(
                    financialSummary.revenue.stakesFromWinningBets || 0
                  )}
                </Typography>
              </Box>
              <Divider />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight="bold">
                  Gross Revenue:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {formatCurrency(financialSummary.revenue.grossRevenue || 0)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Expenses Section */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 0,
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
            <Typography variant="h5" gutterBottom fontWeight="bold">
              💸 Expense Analysis
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">
                  Net Winnings Paid to Users:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {formatCurrency(
                    financialSummary.expenses.netWinningsPaidToUsers || 0
                  )}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Total Payouts:</Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {formatCurrency(
                    financialSummary.expenses.payoutBreakdown?.total || 0
                  )}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Profit Analysis */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 0,
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
            <Typography variant="h5" gutterBottom fontWeight="bold">
              📈 Profit Analysis
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Gross Profit:</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(financialSummary.profit?.grossProfit || 0)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Net Profit:</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(financialSummary.profit?.netProfit || 0)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Profit Margin:</Typography>
                <Chip
                  label={`${(financialSummary.profit?.profitMargin || 0).toFixed(1)}%`}
                  color={
                    (financialSummary.profit?.profitMargin || 0) > 20
                      ? "success"
                      : (financialSummary.profit?.profitMargin || 0) > 10
                        ? "warning"
                        : "error"
                  }
                  variant="filled"
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 0,
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
            <Typography variant="h5" gutterBottom fontWeight="bold">
              🎯 Performance Metrics
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Total Bets:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {financialSummary.performance.totalBets}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Win Rate:</Typography>
                <Chip
                  label={`${(financialSummary.performance?.winRate || 0).toFixed(1)}%`}
                  color={
                    (financialSummary.performance?.winRate || 0) > 50
                      ? "success"
                      : (financialSummary.performance?.winRate || 0) > 30
                        ? "warning"
                        : "error"
                  }
                  variant="filled"
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Average Stake:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(financialSummary.performance.averageStake)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Average Winnings:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(financialSummary.performance.averageWinnings)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => !isExporting && setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 0,
            color: "white",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "white",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Export Financial Data to Excel
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {exportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {exportError}
            </Alert>
          )}

          <Typography
            variant="body2"
            sx={{ mb: 3, color: "rgba(255,255,255,0.7)" }}
          >
            Select the number of days to include in your export. The export will
            include:
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "rgba(255,255,255,0.8)" }}
            >
              • Summary sheet with financial overview
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "rgba(255,255,255,0.8)" }}
            >
              • Payouts sheet with detailed payout information
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "rgba(255,255,255,0.8)" }}
            >
              • Bets sheet with bet details and selection counts
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "rgba(255,255,255,0.8)" }}
            >
              • Selections sheet with game results and outcomes
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
              Export Period
            </InputLabel>
            <Select
              value={exportDays}
              onChange={(e) => setExportDays(Number(e.target.value))}
              label="Export Period"
              disabled={isExporting}
              sx={{
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4caf50",
                },
              }}
            >
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={14}>Last 14 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={60}>Last 60 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
              <MenuItem value={180}>Last 6 months</MenuItem>
              <MenuItem value={365}>Last year</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Button
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
            sx={{ color: "rgba(255,255,255,0.7)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExportToExcel}
            disabled={isExporting}
            variant="contained"
            startIcon={
              isExporting ? (
                <CircularProgress size={20} />
              ) : (
                <FileDownloadIcon />
              )
            }
            sx={{
              background: "linear-gradient(45deg, #4caf50, #45a049)",
              "&:hover": {
                background: "linear-gradient(45deg, #45a049, #3d8b40)",
              },
              "&:disabled": {
                background: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.3)",
              },
            }}
          >
            {isExporting ? "Exporting..." : "Export to Excel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
