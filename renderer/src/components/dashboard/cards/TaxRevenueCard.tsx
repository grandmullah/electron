import React from "react";
import { FinancialSummary } from "../../../services/financialSummaryService";
import { MetricCard } from "../shared/MetricCard";
import { MetricDisplay } from "../shared/MetricDisplay";
import { StatusChip } from "../shared/StatusChip";
import { createTaxRevenueConfig } from "../../../config/financialCardConfigs";

interface TaxRevenueCardProps {
  financialSummary: FinancialSummary | null;
  formatCurrency: (amount: number) => string;
}

export const TaxRevenueCard: React.FC<TaxRevenueCardProps> = ({
  financialSummary,
  formatCurrency,
}) => {
  const taxData = financialSummary?.tax || {
    totalTaxCollected: 0,
    totalTaxPending: 0,
    totalTaxCalculated: 0,
    taxRate: 0,
    effectiveTaxCollected: 0,
    taxBreakdown: {
      collected: 0,
      pending: 0,
      calculated: 0,
      uncollected: 0,
    },
  };

  const config = createTaxRevenueConfig();
  const mainColor = config.getColor(taxData.totalTaxCollected);

  return (
    <MetricCard
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
    >
      <MetricDisplay
        label="Total Tax Collected"
        value={formatCurrency(taxData.totalTaxCollected)}
        color={mainColor}
        description="From completed payouts"
        icon={config.getIcon(taxData.totalTaxCollected)}
        showIcon
      />

      <MetricDisplay
        label="Tax Rate"
        value={`${taxData.taxRate.toFixed(1)}%`}
        color="#2196f3"
        variant="h6"
      />

      <MetricDisplay
        label="Tax Pending"
        value={formatCurrency(taxData.totalTaxPending)}
        color="#ff9800"
        variant="h6"
        description="From pending payouts"
      />

      <MetricDisplay
        label="Total Tax Calculated"
        value={formatCurrency(taxData.totalTaxCalculated)}
        color="#21cbf3"
        variant="h6"
        description="All calculated tax"
      />

      <StatusChip
        label={config.getStatusLabel(taxData.totalTaxCollected)}
        color={mainColor}
        icon={config.getStatusIcon()}
      />
    </MetricCard>
  );
};
