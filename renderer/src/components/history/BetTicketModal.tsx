import React from "react";
import { DisplayBet } from "../../types/history";

interface BetTicketModalProps {
  bet: DisplayBet;
  onClose: () => void;
  onPrint: (bet: DisplayBet) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const BetTicketModal: React.FC<BetTicketModalProps> = ({
  bet,
  onClose,
  onPrint,
  getStatusColor,
  getStatusIcon,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content bet-ticket-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Bet Ticket - {bet.id}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="bet-ticket-content">
            <div className="ticket-header">
              <h4>Betzone</h4>
              <p>Bet Ticket</p>
            </div>
            <div className="ticket-info">
              <div className="info-row">
                <span className="info-label">Bet ID:</span>
                <span className="info-value">{bet.id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Type:</span>
                <span className="info-value">{bet.betType}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Stake:</span>
                <span className="info-value">SSP {bet.totalStake}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Potential Winnings:</span>
                <span className="info-value">
                  SSP {bet.potentialWinnings.toFixed(2)}
                </span>
              </div>
              {bet.taxPercentage && bet.taxPercentage > 0 && (
                <>
                  <div className="info-row">
                    <span className="info-label">
                      Tax ({bet.taxPercentage}%):
                    </span>
                    <span className="info-value tax-amount">
                      -SSP {bet.taxAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Net Winnings:</span>
                    <span className="info-value net-winnings">
                      SSP {bet.netWinnings?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </>
              )}
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span
                  className="info-value"
                  style={{ color: getStatusColor(bet.status) }}
                >
                  {getStatusIcon(bet.status)} {bet.status}
                </span>
              </div>
            </div>
            <div className="ticket-selections">
              <h5>Selections:</h5>
              {bet.selections.map((selection, index) => (
                <div key={index} className="ticket-selection">
                  <div className="selection-header">
                    <span className="selection-number">{index + 1}.</span>
                    <span className="selection-teams">
                      {selection.homeTeam} vs {selection.awayTeam}
                    </span>
                  </div>
                  <div className="selection-details">
                    <span className="selection-bet-type">
                      {selection.betType}
                    </span>
                    <span className="selection-choice">
                      {selection.selection}
                    </span>
                    <span className="selection-odds">@ {selection.odds}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => onPrint(bet)}>
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
