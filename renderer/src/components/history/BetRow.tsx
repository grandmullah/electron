import React from "react";
import { DisplayBet } from "../../types/history";

interface BetRowProps {
  bet: DisplayBet;
  onPrint: (bet: DisplayBet) => void;
  onView: (bet: DisplayBet) => void;
  onCancel?: (bet: DisplayBet) => void;
  onSettle?: (bet: DisplayBet) => void;
  onPayout?: (bet: DisplayBet) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const BetRow: React.FC<BetRowProps> = ({
  bet,
  onPrint,
  onView,
  onCancel,
  onSettle,
  onPayout,
  getStatusColor,
  getStatusIcon,
}) => {
  // Check if bet is eligible for payout (won status)
  const isEligibleForPayout = bet.status === "won";

  // Get the first selection for display
  const firstSelection = bet.selections[0];

  return (
    <div className="bet-row">
      <div className="table-col col-bet-id" data-label="Bet ID">
        <span className="bet-id-short" title={bet.betId || "Unknown"}>
          {bet.betId ? bet.betId.substring(0, 8) + "..." : "Unknown"}
        </span>
      </div>
      <div className="table-col col-game" data-label="Game">
        <div className="game-info">
          <span className="bet-type-badge">
            {bet.betType === "single" ? "Single Bet" : "Multibet"}
          </span>
          {bet.shop && (
            <span
              className="shop-indicator"
              title={`Shop: ${bet.shop.shopName} (${bet.shop.shopCode})`}
            >
              🏪
            </span>
          )}
          {firstSelection && (
            <div className="teams">
              {firstSelection.homeTeam} vs {firstSelection.awayTeam}
            </div>
          )}
        </div>
      </div>
      <div className="table-col col-selection" data-label="Selection">
        <div className="selection-info">
          {firstSelection && (
            <>
              <span className="selection-text">{firstSelection.selection}</span>
              <span className="odds">
                {bet.combinedOdds?.toFixed(2) || "N/A"}x
              </span>
            </>
          )}
        </div>
      </div>
      <div className="table-col col-stake" data-label="Stake">
        <span className="stake-amount">SSP{bet.totalStake}</span>
      </div>
      <div className="table-col col-potential" data-label="Potential">
        <span className="potential-amount">
          SSP{bet.potentialWinnings.toFixed(2)}
        </span>
      </div>

      <div className="table-col col-status" data-label="Status">
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(bet.status) }}
        >
          {getStatusIcon(bet.status)} {bet.status}
        </span>
      </div>
      <div className="table-col col-date" data-label="Date">
        <span className="bet-date">
          {new Date(bet.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="table-col col-bet-actions" data-label="Actions">
        <div className="bet-actions">
          {bet.status === "won" ? (
            // For won bets, only show payout action
            isEligibleForPayout &&
            onPayout && (
              <button
                className="action-btn payout-btn"
                onClick={() => onPayout(bet)}
                title="Process Payout"
              >
                💰
              </button>
            )
          ) : (
            // For other bet statuses, show print and view actions
            <>
              <button
                className="action-btn print-btn"
                onClick={() => onPrint(bet)}
                title="Print Thermal Ticket"
              >
                🖨️
              </button>
              <button
                className="action-btn view-btn"
                onClick={() => onView(bet)}
                title="View Bet Ticket"
              >
                👁️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
