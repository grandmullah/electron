import React from "react";

interface HistoryInfoProps {
  totalFiltered: number;
  searchTerm?: string;
  betStatusFilter: string;
  betTypeFilter: string;
}

export const HistoryInfo: React.FC<HistoryInfoProps> = ({
  totalFiltered,
  searchTerm,
  betStatusFilter,
  betTypeFilter,
}) => {
  return (
    <div className="bets-info">
      <div className="info-message">
        <strong>ℹ️ Showing {totalFiltered} bets</strong>
        {searchTerm && ` matching "${searchTerm}"`}
        {betStatusFilter !== "all" && ` with status "${betStatusFilter}"`}
        {betTypeFilter !== "all" && ` of type "${betTypeFilter}"`}
      </div>
    </div>
  );
};
