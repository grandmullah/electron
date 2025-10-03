import React from "react";
import { FinancialSummary } from "../../../services/financialSummaryService";
import { MetricCard } from "../shared/MetricCard";
import { MetricDisplay } from "../shared/MetricDisplay";
import { StatusChip } from "../shared/StatusChip";
import { RevenueBreakdown } from "../shared/RevenueBreakdown";
import { createTotalRevenueConfig } from "../../../config/financialCardConfigs";

interface TotalRevenueCardProps {
  financialSummary: FinancialSummary | null;
  formatCurrency: (amount: number) => string;
}

export const TotalRevenueCard: React.FC<TotalRevenueCardProps> = ({
  financialSummary,
  formatCurrency,
}) => {
  const revenueData = financialSummary?.revenue || {
    totalStakesReceived: 0,
    stakesKeptFromLostBets: 0,
    totalTaxCollected: 0,
    totalRevenue: 0,
  };

  const config = createTotalRevenueConfig();
  const mainColor = config.getColor(revenueData.totalRevenue);
  const revenueEfficiency =
    revenueData.totalStakesReceived > 0
      ? (
          (revenueData.totalRevenue / revenueData.totalStakesReceived) *
          100
        ).toFixed(1)
      : 0;

  const breakdownItems = [
    {
      label: "From Lost Bets",
      value: formatCurrency(revenueData.stakesKeptFromLostBets),
      color: "#ffc107",
    },
    {
      label: "From Tax",
      value: formatCurrency(revenueData.totalTaxCollected),
      color: "#ff9800",
    },
  ];

  return (
    <MetricCard
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
    >
      <MetricDisplay
        label="Total Revenue"
        value={formatCurrency(revenueData.totalRevenue)}
        color={mainColor}
        description="Stakes + Tax collected"
        icon={config.getIcon(revenueData.totalRevenue)}
        showIcon
      />

      <RevenueBreakdown items={breakdownItems} />

      <MetricDisplay
        label="Revenue Efficiency"
        value={`${revenueEfficiency}%`}
        color="#ffc107"
        variant="h6"
        description="Revenue as % of total stakes"
      />

      <StatusChip
        label={config.getStatusLabel(revenueData.totalRevenue)}
        color={mainColor}
        icon={config.getStatusIcon()}
      />
    </MetricCard>
  );
};
