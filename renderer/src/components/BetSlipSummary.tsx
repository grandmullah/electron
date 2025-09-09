import React from "react";
import type { BetSlip, BetSlipResponse } from "../types/bets";

function formatCurrency(amount?: number, currency = "USD") {
  // Debug logging
  console.log("formatCurrency called with:", {
    amount,
    currency,
    type: typeof amount,
  });

  // Handle undefined, null, or NaN values
  if (amount === undefined || amount === null || isNaN(amount)) {
    console.warn("Invalid amount for formatCurrency:", amount);
    return "-";
  }

  // Ensure amount is a number
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    console.warn("Amount cannot be converted to number:", amount);
    return "-";
  }

  try {
    // Handle SSP currency specifically
    if (currency === "SSP") {
      return `SSP ${numericAmount.toFixed(2)}`;
    }

    // Try standard currency formatting
    const formatted = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(numericAmount);

    console.log("Currency formatted successfully:", formatted);
    return formatted;
  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDateTime(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return dateString;
  }
}

interface BetSlipSummaryProps {
  slip: BetSlip | BetSlipResponse["data"];
  currency?: string;
  isMultibet?: boolean;
  stake?: number;
  isLoading?: boolean;
  betSlipResponse?: BetSlipResponse | undefined;
}

export default function BetSlipSummary({
  slip,
  currency = "SSP",
  isMultibet = false,
  stake,
  isLoading = false,
  betSlipResponse,
}: BetSlipSummaryProps) {
  if (isLoading) {
    return (
      <div className="betslip-summary loading">
        <div className="loading-spinner"></div>
        <p>Calculating bet details...</p>
      </div>
    );
  }

  // Check if we have the enhanced response data
  const hasEnhancedData = betSlipResponse?.data;
  const enhancedData = hasEnhancedData ? betSlipResponse.data : null;

  // Debug logging for all values
  console.log("BetSlipSummary debug data:", {
    hasEnhancedData,
    enhancedData,
    slip,
    stake,
    currency,
    enhancedDataStake: enhancedData?.stake,
    slipStake: slip.stake,
    enhancedDataPotentialWinnings: enhancedData?.potentialWinnings,
    slipPotentialWinnings: slip.potentialWinnings,
    enhancedDataNetWinnings: enhancedData?.details?.taxInfo?.netWinnings,
    slipNetWinnings: slip.netWinnings,
    enhancedDataTaxAmount: enhancedData?.details?.taxInfo?.amount,
    slipTaxAmount: slip.taxAmount,
  });

  // Safely extract values with fallbacks
  const taxPct = enhancedData?.details?.taxInfo?.percentage ?? 0;
  const taxAmt = enhancedData?.details?.taxInfo?.amount ?? 0;

  // Calculate net winnings safely
  let net = 0;
  if (
    enhancedData?.details?.taxInfo?.netWinnings !== undefined &&
    !isNaN(enhancedData.details.taxInfo.netWinnings)
  ) {
    net = enhancedData.details.taxInfo.netWinnings;
  } else if (slip.netWinnings !== undefined && !isNaN(slip.netWinnings)) {
    net = slip.netWinnings;
  } else if (
    slip.potentialWinnings !== undefined &&
    !isNaN(slip.potentialWinnings)
  ) {
    net = slip.potentialWinnings - taxAmt;
  }

  // Ensure net is a valid number
  if (isNaN(net)) net = 0;

  // Get display stake safely
  let displayStake = 0;
  if (stake !== undefined && !isNaN(stake)) {
    displayStake = stake;
  } else if (enhancedData?.stake !== undefined && !isNaN(enhancedData.stake)) {
    displayStake = enhancedData.stake;
  } else if (slip.stake !== undefined && !isNaN(slip.stake)) {
    displayStake = slip.stake;
  }

  // Ensure displayStake is a valid number
  if (isNaN(displayStake)) displayStake = 0;

  // Additional validation for net calculation
  const calculatedNet = slip.potentialWinnings - taxAmt;
  console.log("Net calculation debug:", {
    potentialWinnings: slip.potentialWinnings,
    taxAmt,
    calculatedNet,
    finalNet: net,
    isNetValid: typeof net === "number" && !isNaN(net),
  });

  return (
    <div className="betslip-summary">
      {/* Enhanced Bet Slip Information */}
      {enhancedData && (
        <>
          <div className="enhanced-betslip-info">
            <div className="betslip-header">
              <div className="betslip-id">
                <span className="label">Bet Slip ID:</span>
                <span className="value">{enhancedData.betSlipId}</span>
              </div>
              <div className="betslip-expiry">
                <span className="label">Expires:</span>
                <span className="value">
                  {formatDateTime(enhancedData.expiresAt)}
                </span>
              </div>
            </div>

            {/* Validation Status */}
            {enhancedData.selections && enhancedData.selections.length > 0 && (
              <div className="validation-status">
                <h4>Validation Status</h4>
                {enhancedData.selections.map((selection, index) => (
                  <div key={index} className="selection-validation">
                    <div className="selection-header">
                      <span className="teams">
                        {selection.homeTeam} vs {selection.awayTeam}
                      </span>
                      <span className="market">
                        {selection.marketType}: {selection.outcome}
                      </span>
                    </div>
                    {selection.validation && (
                      <div className="validation-details">
                        <span
                          className={`status ${selection.validation.oddsVerified ? "valid" : "invalid"}`}
                        >
                          {selection.validation.oddsVerified ? "✅" : "❌"} Odds
                          Verified
                        </span>
                        <span
                          className={`status ${selection.validation.gameExists ? "valid" : "invalid"}`}
                        >
                          {selection.validation.gameExists ? "✅" : "❌"} Game
                          Exists
                        </span>
                        <span
                          className={`status ${selection.validation.oddsMatch ? "valid" : "invalid"}`}
                        >
                          {selection.validation.oddsMatch ? "✅" : "❌"} Odds
                          Match
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Frontend Data */}
            {enhancedData.details?.frontendData && (
              <div className="frontend-data">
                <h4>Bet Information</h4>
                <div className="frontend-info">
                  <span
                    className={`status ${enhancedData.details.frontendData.canPlaceBet ? "valid" : "invalid"}`}
                  >
                    {enhancedData.details.frontendData.canPlaceBet
                      ? "✅"
                      : "❌"}{" "}
                    Can Place Bet
                  </span>
                  <span
                    className={`status ${enhancedData.details.frontendData.requiresConfirmation ? "warning" : "info"}`}
                  >
                    {enhancedData.details.frontendData.requiresConfirmation
                      ? "⚠️"
                      : "ℹ️"}{" "}
                    Requires Confirmation
                  </span>
                  <span className="processing-time">
                    ⏱️{" "}
                    {enhancedData.details.frontendData.estimatedProcessingTime}
                  </span>
                </div>
              </div>
            )}

            {/* Next Steps */}
            {enhancedData.nextSteps && enhancedData.nextSteps.length > 0 && (
              <div className="next-steps">
                <h4>Next Steps</h4>
                <ul>
                  {enhancedData.nextSteps?.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <hr className="summary-divider" />
        </>
      )}

      {/* Standard Summary */}
      {/* <div className="summary-row">
        <span className="summary-label">Stake</span>
        <strong className="summary-value">
          {formatCurrency(displayStake, currency)}
        </strong>
      </div> */}

      <div className="summary-row">
        <span className="summary-label">Potential winnings</span>
        <strong className="summary-value">
          {formatCurrency(
            (() => {
              let potentialWinnings = 0;
              if (
                enhancedData?.potentialWinnings !== undefined &&
                !isNaN(enhancedData.potentialWinnings)
              ) {
                potentialWinnings = enhancedData.potentialWinnings;
              } else if (
                slip.potentialWinnings !== undefined &&
                !isNaN(slip.potentialWinnings)
              ) {
                potentialWinnings = slip.potentialWinnings;
              }
              return isNaN(potentialWinnings) ? 0 : potentialWinnings;
            })(),
            currency
          )}
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

      {/* Combined Odds for Multibet */}
      {isMultibet && enhancedData?.summary?.combinedOdds && (
        <div className="summary-row">
          <span className="summary-label">Combined Odds</span>
          <strong className="summary-value">
            {enhancedData.summary.combinedOdds.decimal.toFixed(2)}
          </strong>
        </div>
      )}
    </div>
  );
}
