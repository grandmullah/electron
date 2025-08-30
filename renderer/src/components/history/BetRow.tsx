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
  // Check if bet is eligible for payout (won and settled)
  const isEligibleForPayout =
    bet.status === "settled" && bet.actualWinnings > 0;

  // Get the first selection for display
  const firstSelection = bet.selections[0];

  return (
    <div className="bet-row">
      <div className="table-col col-bet-id">
        <span className="bet-id-short" title={bet.id}>
          {bet.id.substring(0, 8)}...
        </span>
      </div>
      <div className="table-col col-game">
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
      <div className="table-col col-selection">
        <div className="selection-info">
          {firstSelection && (
            <>
              <span className="selection-text">{firstSelection.selection}</span>
              <span className="odds">{firstSelection.odds}x</span>
            </>
          )}
        </div>
      </div>
      <div className="table-col col-stake">
        <span className="stake-amount">SSP{bet.totalStake}</span>
      </div>
      <div className="table-col col-potential">
        <span className="potential-amount">
          SSP{bet.potentialWinnings.toFixed(2)}
        </span>
      </div>

      <div className="table-col col-status">
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(bet.status) }}
        >
          {getStatusIcon(bet.status)} {bet.status}
        </span>
      </div>
      <div className="table-col col-date">
        <span className="bet-date">
          {new Date(bet.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="table-col col-bet-actions">
        <div className="bet-actions">
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
          {bet.status === "pending" && onCancel && (
            <button
              className="action-btn cancel-btn"
              onClick={() => onCancel(bet)}
              title="Cancel Bet"
            >
              🚫
            </button>
          )}
          {bet.status === "accepted" && onSettle && (
            <button
              className="action-btn settle-btn"
              onClick={() => onSettle(bet)}
              title="Settle Bet"
            >
              🏆
            </button>
          )}
          {isEligibleForPayout && onPayout && (
            <button
              className="action-btn payout-btn"
              onClick={() => onPayout(bet)}
              title="Process Payout"
            >
              💰
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
