import React from "react";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { EmptyState } from "./shared/EmptyState";
import { FinancialAnalysisCard } from "./FinancialAnalysisCard";
import { FinancialSummary } from "../../services/financialSummaryService";
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
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
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
}) => {
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
      </Paper>

      {/* Financial Analysis Card */}
      <FinancialAnalysisCard
        financialSummary={financialSummary}
        getFinancialAnalysis={getFinancialAnalysis}
      />

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
            <Typography variant="h5" gutterBottom fontWeight="bold">
              💰 Revenue Analysis
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Total Stakes Received:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(financialSummary.revenue.totalStakesReceived)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">
                  Stakes Kept from Lost Bets:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(
                    financialSummary.revenue.stakesKeptFromLostBets
                  )}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Total Tax Collected:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(financialSummary.revenue.totalTaxCollected)}
                </Typography>
              </Box>
              <Divider />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight="bold">
                  Total Revenue:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {formatCurrency(financialSummary.revenue.totalRevenue)}
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
            <Typography variant="h5" gutterBottom fontWeight="bold">
              💸 Expense Analysis
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Actual Winnings Paid:</Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {formatCurrency(financialSummary.expenses.actualWinningsPaid)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Total Payout Amount:</Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {formatCurrency(financialSummary.expenses.totalPayoutAmount)}
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
                  {formatCurrency(financialSummary.profit.grossProfit)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Net Profit:</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(financialSummary.profit.netProfit)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Profit Margin:</Typography>
                <Chip
                  label={`${financialSummary.profit.profitMargin.toFixed(1)}%`}
                  color={
                    financialSummary.profit.profitMargin > 20
                      ? "success"
                      : financialSummary.profit.profitMargin > 10
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
                  label={`${financialSummary.performance.winRate.toFixed(1)}%`}
                  color={
                    financialSummary.performance.winRate > 50
                      ? "success"
                      : financialSummary.performance.winRate > 30
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
    </Box>
  );
};
