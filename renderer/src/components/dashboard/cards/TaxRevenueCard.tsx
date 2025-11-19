import React from "react";
import dayjs from "dayjs";
import { Box, Typography } from "@mui/material";
import {
  FinancialSummary,
  GovernmentPaymentSummary,
} from "../../../services/financialSummaryService";
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
  const currentTaxObligations = financialSummary?.taxObligations;
  const legacyTax = financialSummary?.tax;
  const governmentPayments = currentTaxObligations?.governmentPayments;
  const taxData = currentTaxObligations
    ? {
        totalTaxCollected:
          currentTaxObligations.taxesCollectedByShop ||
          (currentTaxObligations as any).totalTaxCollected ||
          0,
        totalTaxPending:
          currentTaxObligations.taxesNotYetCollected ||
          (currentTaxObligations as any).totalTaxPending ||
          0,
        totalTaxCalculated:
          currentTaxObligations.totalTaxesOwedToGovernment ||
          (currentTaxObligations as any).totalTaxCalculated ||
          0,
        taxRate: currentTaxObligations.taxRate || 0,
        effectiveTaxCollected: currentTaxObligations.effectiveTaxCollected || 0,
      }
    : legacyTax
      ? {
          totalTaxCollected: legacyTax.totalTaxCollected,
          totalTaxPending: legacyTax.totalTaxPending,
          totalTaxCalculated: legacyTax.totalTaxCalculated,
          taxRate: legacyTax.taxRate,
          effectiveTaxCollected: legacyTax.effectiveTaxCollected,
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
  const totalPaidToGovernment =
    governmentPayments?.totalTaxesPaidToGovernment ?? 0;
  const pendingRemittance =
    governmentPayments?.pendingTaxesToPay ??
    Math.max(taxData.totalTaxCalculated - totalPaidToGovernment, 0);
  const lastPaymentDate = governmentPayments?.lastPaymentDate
    ? dayjs(governmentPayments.lastPaymentDate).format("MMM D, YYYY")
    : null;
  const paymentStatus = governmentPayments?.paymentStatus;

  // Calculate effective tax rate: (tax collected / total potential winnings) * 100
  // Total potential winnings = net winnings paid + tax collected
  const expensesData = financialSummary?.expenses;
  const netWinningsPaid = expensesData?.netWinningsPaidToUsers || 0;
  const totalPotentialWinnings = netWinningsPaid + taxData.totalTaxCollected;
  const effectiveTaxRate =
    totalPotentialWinnings > 0
      ? (taxData.totalTaxCollected / totalPotentialWinnings) * 100
      : 0;

  return (
    <MetricCard
      title="💸 Tax Obligations"
      subtitle="Taxes owed to government"
      icon={config.icon}
      iconColor={config.iconColor}
      topBorderColor={config.topBorderColor}
      sx={{
        minWidth: { xs: "200px", sm: "220px" },
        maxWidth: { xs: "200px", sm: "220px" },
        width: { xs: "200px", sm: "220px" },
        flex: "0 0 auto",
      }}
    >
      <MetricDisplay
        label="Collected by Shop"
        value={formatCurrency(taxData.totalTaxCollected)}
        color={mainColor}
        description="Deducted from completed payouts"
        icon={config.getIcon(taxData.totalTaxCollected)}
        showIcon
      />

      <Box
        display="grid"
        width="100%"
        gridTemplateColumns="1fr"
        rowGap={1.2}
        mt={1.5}
      >
        <MetricDisplay
          label="Effective Tax Rate"
          value={`${effectiveTaxRate.toFixed(2)}%`}
          color="#2196f3"
          variant="h6"
          description="Calculated from actual tax collected vs potential winnings"
        />

        <MetricDisplay
          label="Pending Collection"
          value={formatCurrency(taxData.totalTaxPending)}
          color="#ff9800"
          variant="h6"
          description="From pending payouts"
        />

        <MetricDisplay
          label="Paid to Government"
          value={formatCurrency(totalPaidToGovernment)}
          color="#66bb6a"
          variant="h6"
          description="All-time government remittances"
        />

        <MetricDisplay
          label="Remittance Outstanding"
          value={formatCurrency(pendingRemittance)}
          color={pendingRemittance > 0 ? "#ffb74d" : "#4caf50"}
          variant="h6"
          description="Taxes collected but not yet remitted"
        />

        <MetricDisplay
          label="Total Owed to Govt"
          value={formatCurrency(taxData.totalTaxCalculated)}
          color="#ef4444"
          variant="h6"
          description="Must be remitted to government"
        />

        {lastPaymentDate && (
          <Box
            sx={{
              gridColumn: {
                xs: "auto",
                sm: "span 2",
              },
            }}
          >
            <MetricDisplay
              label="Last Payment Date"
              value={lastPaymentDate}
              color="#90caf9"
              variant="body1"
            />
          </Box>
        )}
      </Box>

      <StatusChip
        label={
          paymentStatus
            ? paymentStatus.fullyPaid
              ? "✅ Fully Remitted"
              : paymentStatus.hasPending
                ? "⚠️ Pending Remittance"
                : "ℹ️ No Government Payments"
            : taxData.totalTaxCollected > 0
              ? "⚠️ Remit to Government"
              : "No Taxes Collected"
        }
        color={
          paymentStatus
            ? paymentStatus.fullyPaid
              ? "#4caf50"
              : paymentStatus.hasPending
                ? "#ff9800"
                : "#9e9e9e"
            : taxData.totalTaxCollected > 0
              ? "#ff9800"
              : "#9e9e9e"
        }
        icon={config.getStatusIcon()}
      />

      {governmentPayments?.note && (
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1, color: "rgba(255,255,255,0.6)" }}
        >
          {governmentPayments.note}
        </Typography>
      )}
    </MetricCard>
  );
};
