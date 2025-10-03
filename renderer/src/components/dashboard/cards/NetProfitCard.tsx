import React from "react";
import { FinancialSummary } from "../../../services/financialSummaryService";
import { MetricCard } from "../shared/MetricCard";
import { MetricDisplay } from "../shared/MetricDisplay";
import { StatusChip } from "../shared/StatusChip";
import { getNetProfitConfig } from "../../../config/financialCardConfigs";

interface NetProfitCardProps {
  financialSummary: FinancialSummary | null;
  formatCurrency: (amount: number) => string;
}

export const NetProfitCard: React.FC<NetProfitCardProps> = ({
  financialSummary,
  formatCurrency,
}) => {
  const profitData = financialSummary?.profit || {
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
  };

  const config = getNetProfitConfig(profitData.netProfit);
  const mainColor = config.getColor(profitData.netProfit);

  return (
    <MetricCard
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
    >
      <MetricDisplay
        label="Net Profit"
        value={formatCurrency(profitData.netProfit)}
        color={mainColor}
        description="Revenue - Expenses"
        icon={config.getIcon(profitData.netProfit)}
        showIcon
      />

      <MetricDisplay
        label="Gross Profit"
        value={formatCurrency(profitData.grossProfit)}
        color="#8bc34a"
        variant="h6"
        description="Before expenses"
      />

      <MetricDisplay
        label="Profit Margin"
        value={`${profitData.profitMargin.toFixed(1)}%`}
        color={mainColor}
        variant="h6"
        description="Net profit percentage"
      />

      <StatusChip
        label={config.getStatusLabel(profitData.netProfit)}
        color={mainColor}
        icon={config.getStatusIcon()}
      />
    </MetricCard>
  );
};
