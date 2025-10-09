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

  const config = createExpensesConfig();
  const mainColor = config.getColor(expensesData.netWinningsPaidToUsers);

  return (
    <MetricCard
      title="💸 Expenses"
      subtitle="Winnings paid to users"
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
    >
      <MetricDisplay
        label="Net Winnings Paid"
        value={formatCurrency(expensesData.netWinningsPaidToUsers)}
        color={mainColor}
        description="After tax deduction"
        icon={config.getIcon(expensesData.netWinningsPaidToUsers)}
        showIcon
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
