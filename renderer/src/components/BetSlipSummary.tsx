import React from "react";
import type { BetSlip } from "../types/bets";

function formatCurrency(amount?: number, currency = "USD") {
  if (typeof amount !== "number") return "-";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

interface BetSlipSummaryProps {
  slip: BetSlip;
  currency?: string;
  isMultibet?: boolean;
  stake?: number;
  isLoading?: boolean;
}

export default function BetSlipSummary({
  slip,
  currency = "USD",
  isMultibet = false,
  stake,
  isLoading = false,
}: BetSlipSummaryProps) {
  if (isLoading) {
    return (
      <div className="betslip-summary loading">
        <div className="loading-spinner"></div>
        <p>Calculating bet details...</p>
      </div>
    );
  }

  const taxPct = slip.taxPercentage ?? 0;
  const taxAmt = slip.taxAmount ?? 0;
  const net = slip.netWinnings ?? slip.potentialWinnings - taxAmt;
  const displayStake = stake || slip.stake;

  return (
    <div className="betslip-summary">
      <div className="summary-row">
        <span className="summary-label">Stake</span>
        <strong className="summary-value">
          {formatCurrency(displayStake, currency)}
        </strong>
      </div>

      <div className="summary-row">
        <span className="summary-label">Potential winnings</span>
        <strong className="summary-value">
          {formatCurrency(slip.potentialWinnings, currency)}
        </strong>
      </div>

      {taxPct > 0 && (
        <div className="summary-row tax-row">
          <span className="summary-label">
            Tax ({taxPct}%)
            <span
              className="tax-tooltip"
              title="Tax is applied on potential winnings before payout"
            >
              ℹ️
            </span>
          </span>
          <strong className="summary-value tax-amount">
            -{formatCurrency(taxAmt, currency)}
          </strong>
        </div>
      )}

      <hr className="summary-divider" />

      <div className="summary-row total-row">
        <span className="summary-label">Net winnings</span>
        <strong className="summary-value total-value">
          {formatCurrency(net, currency)}
        </strong>
      </div>
    </div>
  );
}
