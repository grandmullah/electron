import React from "react";
import { FinancialSummary } from "../../../services/financialSummaryService";
import { MetricCard } from "../shared/MetricCard";
import { MetricDisplay } from "../shared/MetricDisplay";
import { StatusChip } from "../shared/StatusChip";
import {
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { Box, Typography, Divider } from "@mui/material";

interface PendingBetsCardProps {
  financialSummary: FinancialSummary | null;
  formatCurrency: (amount: number) => string;
}

export const PendingBetsCard: React.FC<PendingBetsCardProps> = ({
  financialSummary,
  formatCurrency,
}) => {
  const pendingData = financialSummary?.pendingBets || {
    count: 0,
    stakesReceived: 0,
  };

  const cancelledData = financialSummary?.cancelledBets || {
    count: 0,
    stakesReturned: 0,
  };

  return (
    <MetricCard
      title="⏳ Active Bets"
      subtitle="Pending & Cancelled"
      icon={<ScheduleIcon />}
      iconColor="#ff9800"
      topBorderColor="#ff9800"
    >
      {/* Pending Bets */}
      <MetricDisplay
        label="Pending Stakes"
        value={formatCurrency(pendingData.stakesReceived)}
        color="#ff9800"
        description={`${pendingData.count} bet${pendingData.count !== 1 ? "s" : ""} pending`}
        icon={<ScheduleIcon />}
        showIcon
      />

      <Box
        sx={{
          p: 1.5,
          background: "rgba(255, 152, 0, 0.1)",
          border: "1px solid rgba(255, 152, 0, 0.2)",
          borderRadius: 0,
          mt: 1,
          mb: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <InfoIcon sx={{ fontSize: 16, color: "#ff9800" }} />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Not included in profit
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 2 }} />

      {/* Cancelled Bets */}
      <MetricDisplay
        label="Cancelled Stakes"
        value={formatCurrency(cancelledData.stakesReturned)}
        color="#9e9e9e"
        variant="h6"
        description={`${cancelledData.count} bet${cancelledData.count !== 1 ? "s" : ""} cancelled`}
      />

      <StatusChip
        label={`${pendingData.count} Pending`}
        color="#ff9800"
        icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
      />
    </MetricCard>
  );
};
