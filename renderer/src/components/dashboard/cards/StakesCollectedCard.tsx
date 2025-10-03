import React from "react";
import { FinancialSummary } from "../../../services/financialSummaryService";
import { MetricCard } from "../shared/MetricCard";
import { MetricDisplay } from "../shared/MetricDisplay";
import { StatusChip } from "../shared/StatusChip";
import { createStakesCollectedConfig } from "../../../config/financialCardConfigs";

interface StakesCollectedCardProps {
  financialSummary: FinancialSummary | null;
  formatCurrency: (amount: number) => string;
}

export const StakesCollectedCard: React.FC<StakesCollectedCardProps> = ({
  financialSummary,
  formatCurrency,
}) => {
  const revenueData = financialSummary?.revenue || {
    totalStakesReceived: 0,
    stakesKeptFromLostBets: 0,
    totalTaxCollected: 0,
    totalRevenue: 0,
  };

  const config = createStakesCollectedConfig();
  const mainColor = config.getColor(revenueData.totalStakesReceived);
  const retentionRate =
    revenueData.totalStakesReceived > 0
      ? (
          (revenueData.stakesKeptFromLostBets /
            revenueData.totalStakesReceived) *
          100
        ).toFixed(1)
      : 0;

  return (
    <MetricCard
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
    >
      <MetricDisplay
        label="Total Stakes Received"
        value={formatCurrency(revenueData.totalStakesReceived)}
        color={mainColor}
        description="All bets placed"
        icon={config.getIcon(revenueData.totalStakesReceived)}
        showIcon
      />

      <MetricDisplay
        label="Stakes Kept from Lost Bets"
        value={formatCurrency(revenueData.stakesKeptFromLostBets)}
        color="#8bc34a"
        variant="h6"
        description="Revenue from losing bets"
      />

      <MetricDisplay
        label="Stake Retention Rate"
        value={`${retentionRate}%`}
        color="#4caf50"
        variant="h6"
      />

      <StatusChip
        label={config.getStatusLabel(revenueData.totalStakesReceived)}
        color={mainColor}
        icon={config.getStatusIcon()}
      />
    </MetricCard>
  );
};
