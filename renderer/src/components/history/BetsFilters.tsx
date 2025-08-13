import React from "react";

interface BetsFiltersProps {
  betStatusFilter:
    | "all"
    | "pending"
    | "accepted"
    | "rejected"
    | "settled"
    | "cancelled";
  setBetStatusFilter: (v: any) => void;
  betTypeFilter: "all" | "single" | "multibet";
  setBetTypeFilter: (v: any) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}

export const BetsFilters: React.FC<BetsFiltersProps> = ({
  betStatusFilter,
  setBetStatusFilter,
  betTypeFilter,
  setBetTypeFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="advanced-filters">
      <div className="filters-row">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={betStatusFilter}
            onChange={(e) => setBetStatusFilter(e.target.value as any)}
            className="form-input"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="settled">Settled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select
            value={betTypeFilter}
            onChange={(e) => setBetTypeFilter(e.target.value as any)}
            className="form-input"
          >
            <option value="all">All Types</option>
            <option value="single">Single Bets</option>
            <option value="multibet">Multibets</option>
          </select>
        </div>

        <div className="filter-group">
          <label>From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="filter-group">
          <label>To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="filter-group search-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search teams, selections, or bet ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};
