import React from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
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
import { FinancialSummary } from "../../services/financialSummaryService";

interface FinancialAnalysisCardProps {
  financialSummary: FinancialSummary | null;
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

export const FinancialAnalysisCard: React.FC<FinancialAnalysisCardProps> = ({
  financialSummary,
  getFinancialAnalysis,
}) => {
  const analysis = getFinancialAnalysis(financialSummary);

  const getMetricColor = (
    value: number,
    type: "revenue" | "expense" | "profit" | "tax"
  ) => {
    switch (type) {
      case "revenue":
        return value > 0 ? "#4caf50" : "#9e9e9e";
      case "expense":
        return "#ff9800";
      case "profit":
        return value > 0 ? "#4caf50" : value < 0 ? "#f44336" : "#9e9e9e";
      case "tax":
        return "#2196f3";
      default:
        return "#9e9e9e";
    }
  };

  const getMetricIcon = (type: "revenue" | "expense" | "profit" | "tax") => {
    switch (type) {
      case "revenue":
        return <BankIcon sx={{ fontSize: 20 }} />;
      case "expense":
        return <MoneyIcon sx={{ fontSize: 20 }} />;
      case "profit":
        return analysis.netProfit >= 0 ? (
          <TrendingUpIcon sx={{ fontSize: 20 }} />
        ) : (
          <TrendingDownIcon sx={{ fontSize: 20 }} />
        );
      case "tax":
        return <ReceiptIcon sx={{ fontSize: 20 }} />;
      default:
        return <AssessmentIcon sx={{ fontSize: 20 }} />;
    }
  };

  return (
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
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            📊 Financial Analysis
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
            Key business metrics and profitability overview
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 0,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    color: getMetricColor(analysis.totalRevenue, "revenue"),
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {getMetricIcon("revenue")}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}
                >
                  Total Revenue
                </Typography>
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  color: getMetricColor(analysis.totalRevenue, "revenue"),
                  fontSize: "1.5rem",
                }}
              >
                {analysis.formattedTotalRevenue}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                Stakes from settled bets
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Actual Expenses */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 0,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    color: getMetricColor(analysis.actualExpenses, "expense"),
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {getMetricIcon("expense")}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}
                >
                  Total Payouts
                </Typography>
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  color: getMetricColor(analysis.actualExpenses, "expense"),
                  fontSize: "1.5rem",
                }}
              >
                {analysis.formattedActualExpenses}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                Total potential winnings (gross)
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Net Profit */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 0,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    color: getMetricColor(analysis.netProfit, "profit"),
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {getMetricIcon("profit")}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}
                >
                  Net Profit
                </Typography>
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  color: getMetricColor(analysis.netProfit, "profit"),
                  fontSize: "1.5rem",
                }}
              >
                {analysis.formattedNetProfit}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                Revenue - Total Payouts
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Tax Collected */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 0,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    color: getMetricColor(analysis.taxCollected, "tax"),
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {getMetricIcon("tax")}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}
                >
                  Tax Collected
                </Typography>
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  color: getMetricColor(analysis.taxCollected, "tax"),
                  fontSize: "1.5rem",
                }}
              >
                {analysis.formattedTaxCollected}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                Owed to government
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary Section */}
      <Box mt={3}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 2 }} />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Financial Analysis Summary
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              icon={<BankIcon sx={{ fontSize: 16 }} />}
              label={`Revenue: ${analysis.formattedTotalRevenue}`}
              variant="outlined"
              size="small"
              sx={{
                color: getMetricColor(analysis.totalRevenue, "revenue"),
                borderColor: getMetricColor(analysis.totalRevenue, "revenue"),
                backgroundColor: "rgba(76, 175, 80, 0.1)",
              }}
            />
            <Chip
              icon={
                analysis.netProfit >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 16 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16 }} />
                )
              }
              label={`Profit: ${analysis.formattedNetProfit}`}
              variant="outlined"
              size="small"
              sx={{
                color: getMetricColor(analysis.netProfit, "profit"),
                borderColor: getMetricColor(analysis.netProfit, "profit"),
                backgroundColor:
                  analysis.netProfit >= 0
                    ? "rgba(76, 175, 80, 0.1)"
                    : "rgba(244, 67, 54, 0.1)",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
