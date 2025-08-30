import React from "react";

interface BetsTableHeaderProps {
  onSort: (key: keyof any) => void;
  getSortIndicator: (key: keyof any) => string;
}

export const BetsTableHeader: React.FC<BetsTableHeaderProps> = ({
  onSort,
  getSortIndicator,
}) => {
  return (
    <div className="bets-table-header">
      <div
        className="table-col col-bet-id sortable"
        onClick={() => onSort("id")}
      >
        Bet ID {getSortIndicator("id")}
      </div>
      <div className="table-col col-game">Game</div>
      <div className="table-col col-selection">Selection</div>
      <div
        className="table-col col-stake sortable"
        onClick={() => onSort("totalStake")}
      >
        Stake {getSortIndicator("totalStake")}
      </div>
      <div
        className="table-col col-potential sortable"
        onClick={() => onSort("potentialWinnings")}
      >
        Potential {getSortIndicator("potentialWinnings")}
      </div>
      <div
        className="table-col col-status sortable"
        onClick={() => onSort("status")}
      >
        Status {getSortIndicator("status")}
      </div>
      <div
        className="table-col col-date sortable"
        onClick={() => onSort("createdAt")}
      >
        Date {getSortIndicator("createdAt")}
      </div>
      <div className="table-col col-bet-actions">Actions</div>
    </div>
  );
};
