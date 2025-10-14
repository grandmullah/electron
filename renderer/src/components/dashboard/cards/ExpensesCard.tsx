import React from "react";
import { FinancialSummary } from "../../../services/financialSummaryService";
import { MetricCard } from "../shared/MetricCard";
import { MetricDisplay } from "../shared/MetricDisplay";
import { StatusChip } from "../shared/StatusChip";
import { createExpensesConfig } from "../../../config/financialCardConfigs";

interface ExpensesCardProps {
  financialSummary: FinancialSummary | null;
  formatCurrency: (amount: number) => string;
}

export const ExpensesCard: React.FC<ExpensesCardProps> = ({
  financialSummary,
  formatCurrency,
}) => {
  const expensesData = financialSummary?.expenses || {
    netWinningsPaidToUsers: 0,
    payoutBreakdown: {
      total: 0,
      completed: 0,
      pending: 0,
      totalCount: 0,
      completedCount: 0,
      pendingCount: 0,
    },
  };

  // Calculate total potential winnings (net winnings + taxes)
  const taxData = financialSummary?.taxObligations || financialSummary?.tax;
  const taxCollected = taxData
    ? ("taxesCollectedByShop" in taxData
        ? taxData.taxesCollectedByShop
        : (taxData as any).totalTaxCollected) || 0
    : 0;

  const totalPotentialWinnings =
    expensesData.netWinningsPaidToUsers + taxCollected;

  const config = createExpensesConfig();
  const mainColor = config.getColor(totalPotentialWinnings);

  return (
    <MetricCard
      title="💸 Expenses"
      subtitle="Total potential winnings"
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
    >
      <MetricDisplay
        label="Total Potential Winnings"
        value={formatCurrency(totalPotentialWinnings)}
        color={mainColor}
        description="Gross amount (before tax)"
        icon={config.getIcon(totalPotentialWinnings)}
        showIcon
      />

      <MetricDisplay
        label="Net Winnings Paid"
        value={formatCurrency(expensesData.netWinningsPaidToUsers)}
        color="#4caf50"
        variant="h6"
        description="Amount paid to users (after tax)"
      />

      <MetricDisplay
        label="Tax Withheld"
        value={formatCurrency(taxCollected)}
        color="#2196f3"
        variant="h6"
        description="Tax collected from winnings"
      />

      <MetricDisplay
        label="Total Payouts"
        value={formatCurrency(expensesData.payoutBreakdown.total)}
        color="#e91e63"
        variant="h6"
        description={`${expensesData.payoutBreakdown.totalCount} payouts`}
      />

      <MetricDisplay
        label="Pending Payouts"
        value={formatCurrency(expensesData.payoutBreakdown.pending)}
        color="#ff9800"
        variant="h6"
        description={`${expensesData.payoutBreakdown.pendingCount} pending`}
      />

      <MetricDisplay
        label="Completed Payouts"
        value={formatCurrency(expensesData.payoutBreakdown.completed)}
        color="#4caf50"
        variant="h6"
        description={`${expensesData.payoutBreakdown.completedCount} completed`}
      />

      <StatusChip
        label={config.getStatusLabel(expensesData.netWinningsPaidToUsers)}
        color={mainColor}
        icon={config.getStatusIcon()}
      />
    </MetricCard>
  );
};
