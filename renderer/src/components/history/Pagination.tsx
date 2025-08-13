import React from "react";

interface PaginationProps {
  startIndex: number;
  endIndex: number;
  total: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  startIndex,
  endIndex,
  total,
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  goToPrevPage,
  goToNextPage,
}) => {
  return (
    <div className="pagination-controls">
      <div className="pagination-info">
        <span className="info-text">
          Showing {startIndex + 1}-{endIndex} of {total} bets
        </span>
      </div>
      <div className="pagination-buttons">
        <button
          className="btn btn-secondary pagination-btn"
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          title="Go to previous page"
        >
          <span className="btn-icon">←</span>
          <span className="btn-text">Previous</span>
        </button>
        <div className="page-info">
          <span className="page-current">{currentPage}</span>
          <span className="page-separator">/</span>
          <span className="page-total">{totalPages}</span>
        </div>
        <button
          className="btn btn-secondary pagination-btn"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          title="Go to next page"
        >
          <span className="btn-text">Next</span>
          <span className="btn-icon">→</span>
        </button>
      </div>
      <div className="items-per-page">
        <label htmlFor="items-per-page-select">Show:</label>
        <select
          id="items-per-page-select"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="form-input"
          title="Select number of items per page"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>
    </div>
  );
};
