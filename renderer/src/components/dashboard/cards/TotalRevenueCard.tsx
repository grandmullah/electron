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
    settledRevenue: 0,
    stakesFromLostBets: 0,
    stakesFromWinningBets: 0,
  };

  const config = createTotalRevenueConfig();
  const mainColor = config.getColor(revenueData.settledRevenue);

  const breakdownItems = [
    {
      label: "From Lost Bets",
      value: formatCurrency(revenueData.stakesFromLostBets),
      color: "#10b981",
    },
    {
      label: "From Winning Bets",
      value: formatCurrency(revenueData.stakesFromWinningBets),
      color: "#f59e0b",
    },
  ];

  return (
    <MetricCard
      title="💰 Settled Revenue"
      subtitle="Stakes from settled bets only"
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
    >
      <MetricDisplay
        label="Settled Revenue"
        value={formatCurrency(revenueData.settledRevenue)}
        color={mainColor}
        description="Won/lost bets only"
        icon={config.getIcon(revenueData.settledRevenue)}
        showIcon
      />

      <RevenueBreakdown items={breakdownItems} />

      <MetricDisplay
        label="Lost Bets %"
        value={`${revenueData.settledRevenue > 0 ? ((revenueData.stakesFromLostBets / revenueData.settledRevenue) * 100).toFixed(1) : 0}%`}
        color="#10b981"
        variant="h6"
        description="Stakes from losing bets"
      />

      <StatusChip
        label={config.getStatusLabel(revenueData.settledRevenue)}
        color={mainColor}
        icon={config.getStatusIcon()}
      />
    </MetricCard>
  );
};
