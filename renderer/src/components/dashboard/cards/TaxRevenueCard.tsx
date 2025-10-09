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
  // Use taxObligations (new) or fall back to tax (legacy)
  const taxObligations =
    financialSummary?.taxObligations || financialSummary?.tax;
  const taxData = taxObligations
    ? {
        totalTaxCollected:
          taxObligations.taxesCollectedByShop ||
          (taxObligations as any).totalTaxCollected ||
          0,
        totalTaxPending:
          taxObligations.taxesNotYetCollected ||
          (taxObligations as any).totalTaxPending ||
          0,
        totalTaxCalculated:
          taxObligations.totalTaxesOwedToGovernment ||
          (taxObligations as any).totalTaxCalculated ||
          0,
        taxRate: taxObligations.taxRate || 0,
        effectiveTaxCollected: taxObligations.effectiveTaxCollected || 0,
      }
    : {
        totalTaxCollected: 0,
        totalTaxPending: 0,
        totalTaxCalculated: 0,
        taxRate: 0,
        effectiveTaxCollected: 0,
      };

  const config = createTaxRevenueConfig();
  const mainColor = config.getColor(taxData.totalTaxCollected);

  return (
    <MetricCard
      title="💸 Tax Obligations"
      subtitle="Taxes owed to government"
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
    >
      <MetricDisplay
        label="Collected by Shop"
        value={formatCurrency(taxData.totalTaxCollected)}
        color={mainColor}
        description="Deducted from completed payouts"
        icon={config.getIcon(taxData.totalTaxCollected)}
        showIcon
      />

      <MetricDisplay
        label="Tax Rate"
        value={`${(taxData.taxRate || 0).toFixed(1)}%`}
        color="#2196f3"
        variant="h6"
      />

      <MetricDisplay
        label="Pending Collection"
        value={formatCurrency(taxData.totalTaxPending)}
        color="#ff9800"
        variant="h6"
        description="From pending payouts"
      />

      <MetricDisplay
        label="Total Owed to Govt"
        value={formatCurrency(taxData.totalTaxCalculated)}
        color="#ef4444"
        variant="h6"
        description="Must be remitted to government"
      />

      <StatusChip
        label={
          taxData.totalTaxCollected > 0
            ? "⚠️ Remit to Government"
            : "No Taxes Collected"
        }
        color={taxData.totalTaxCollected > 0 ? "#ff9800" : "#9e9e9e"}
        icon={config.getStatusIcon()}
      />
    </MetricCard>
  );
};
