import React from "react";
import { FinancialSummary } from "../../../services/financialSummaryService";
import { MetricCard } from "../shared/MetricCard";
import { MetricDisplay } from "../shared/MetricDisplay";
import { StatusChip } from "../shared/StatusChip";
import { createPerformanceConfig } from "../../../config/financialCardConfigs";

interface PerformanceCardProps {
  financialSummary: FinancialSummary | null;
  formatCurrency: (amount: number) => string;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({
  financialSummary,
  formatCurrency,
}) => {
  const performanceData = financialSummary?.performance || {
    totalBets: 0,
    winRate: 0,
    averageStake: 0,
    averageWinnings: 0,
  };

  const config = createPerformanceConfig();
  const mainColor = config.getColor(performanceData.totalBets);

  return (
    <MetricCard
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
    >
      <MetricDisplay
        label="Total Bets"
        value={performanceData.totalBets.toString()}
        color={mainColor}
        description="Bets placed in period"
        icon={config.getIcon(performanceData.totalBets)}
        showIcon
      />

      <MetricDisplay
        label="Win Rate"
        value={`${(performanceData.winRate || 0).toFixed(1)}%`}
        color={
          (performanceData.winRate || 0) > 50
            ? "#4caf50"
            : (performanceData.winRate || 0) > 30
              ? "#ff9800"
              : "#f44336"
        }
        variant="h6"
        description="Percentage of winning bets"
      />

      <MetricDisplay
        label="Average Stake"
        value={formatCurrency(performanceData.averageStake)}
        color="#2196f3"
        variant="h6"
        description="Per bet average"
      />

      <MetricDisplay
        label="Average Winnings"
        value={formatCurrency(performanceData.averageWinnings)}
        color="#9c27b0"
        variant="h6"
        description="Per winning bet"
      />

      <StatusChip
        label={config.getStatusLabel(performanceData.totalBets)}
        color={mainColor}
        icon={config.getStatusIcon()}
      />
    </MetricCard>
  );
};
