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
    actualWinningsPaid: 0,
    totalPayoutAmount: 0,
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
  const mainColor = config.getColor(expensesData.actualWinningsPaid);
  const expenseRatio =
    expensesData.totalPayoutAmount > 0
      ? (
          (expensesData.actualWinningsPaid / expensesData.totalPayoutAmount) *
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
        label="Actual Winnings Paid"
        value={formatCurrency(expensesData.actualWinningsPaid)}
        color={mainColor}
        description="Net winnings paid to users"
        icon={config.getIcon(expensesData.actualWinningsPaid)}
        showIcon
      />

      <MetricDisplay
        label="Total Payout Amount"
        value={formatCurrency(expensesData.totalPayoutAmount)}
        color="#e91e63"
        variant="h6"
        description="Gross payout amount"
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
        label={config.getStatusLabel(expensesData.actualWinningsPaid)}
        color={mainColor}
        icon={config.getStatusIcon()}
      />
    </MetricCard>
  );
};
