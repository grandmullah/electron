import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "../../store/hooks";
import { Header } from "../../components/Header";
import { DisplayBet } from "../../types/history";
import { BetsTableHeader } from "../../components/history/BetsTableHeader";
import { BetRow } from "../../components/history/BetRow";
import { BetsFilters } from "../../components/history/BetsFilters";
import { Pagination } from "../../components/history/Pagination";
import { BetTicketModal } from "../../components/history/BetTicketModal";
import { HistoryInfo } from "../../components/history/HistoryInfo";
import {
  BetHistoryService,
  SingleBet,
  Multibet,
  BetHistoryFilters,
  getBetStatistics,
  exportBetHistory,
} from "../../services/betHistoryService";
import { printThermalTicket as printTicket } from "../../services/printService";

interface HistoryPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

interface BetStatistics {
  totalBets: number;
  totalStake: number;
  totalWinnings: number;
  winRate: number;
  averageOdds: number;
}

interface SortConfig {
  key: keyof any;
  direction: "asc" | "desc";
}

// Extended bet interface for display purposes
// Moved to ../../types/history

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<"bets">("bets");

  // Enhanced filters
  const [betStatusFilter, setBetStatusFilter] = useState<
    "all" | "pending" | "accepted" | "rejected" | "settled" | "cancelled"
  >("all");
  const [betTypeFilter, setBetTypeFilter] = useState<
    "all" | "single" | "multibet"
  >("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  });

  // UI state
  const [showBetTicket, setShowBetTicket] = useState(false);
  const [selectedBetTicket, setSelectedBetTicket] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [betToCancel, setBetToCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [betToSettle, setBetToSettle] = useState<any>(null);
  const [settleResult, setSettleResult] = useState<"won" | "lost">("won");

  // Data state
  const [singleBets, setSingleBets] = useState<DisplayBet[]>([]);
  const [multibets, setMultibets] = useState<DisplayBet[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [betStatistics, setBetStatistics] = useState<BetStatistics | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load bet history when component mounts or filters change
  useEffect(() => {
    console.log(
      "useEffect triggered - activeTab:",
      activeTab,
      "betStatusFilter:",
      betStatusFilter,
      "betTypeFilter:",
      betTypeFilter
    );
    if (activeTab === "bets") {
      loadBetHistory();
      // loadBetStatistics();
    }
  }, [
    activeTab,
    betStatusFilter,
    betTypeFilter,
    dateFrom,
    dateTo,
    debouncedSearchTerm,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [betStatusFilter, betTypeFilter, dateFrom, dateTo, debouncedSearchTerm]);

  const loadBetHistory = async () => {
    setIsLoadingBets(true);
    setBetError(null);

    try {
      const filters: BetHistoryFilters = {};
      if (betStatusFilter !== "all") {
        filters.status = betStatusFilter as any;
      }
      if (betTypeFilter !== "all") {
        filters.betType = betTypeFilter as any;
      }
      if (dateFrom) {
        filters.dateFrom = dateFrom;
      }
      if (dateTo) {
        filters.dateTo = dateTo;
      }

      // Add timeout to API call
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("API timeout")), 10000)
      );

      const apiPromise = BetHistoryService.getUserBets(filters);
      const response = (await Promise.race([
        apiPromise,
        timeoutPromise,
      ])) as any;

      if (response.success && response.data) {
        // The API returns a single bets array with mixed bet types
        const apiBets = response.data.bets || [];

        // Process all bets and separate them by type
        const processedSingleBets: DisplayBet[] = [];
        const processedMultibets: DisplayBet[] = [];

        apiBets.forEach((bet: any) => {
          if (bet.betType === "single") {
            processedSingleBets.push({
              id: bet.id,
              betType: "single",
              totalStake: bet.stake,
              potentialWinnings: bet.potentialWinnings,
              actualWinnings: 0, // Not provided in API
              createdAt: bet.createdAt,
              settledAt: "", // Not provided in API
              status: bet.status,
              selections: bet.selections.map((selection: any) => ({
                gameId: selection.gameId,
                homeTeam: selection.homeTeam,
                awayTeam: selection.awayTeam,
                betType: selection.marketType,
                selection: selection.outcome,
                odds: selection.odds?.decimal || bet.odds?.decimal,
                stake: bet.stake,
                potentialWinnings: bet.potentialWinnings,
                result: bet.status,
              })),
              taxPercentage: bet.taxPercentage,
              taxAmount: bet.taxAmount,
              netWinnings: bet.netWinnings,
            });
          } else if (bet.betType === "multiple") {
            processedMultibets.push({
              id: bet.id,
              betType: "multibet",
              totalStake: bet.stake,
              potentialWinnings: bet.potentialWinnings,
              actualWinnings: 0, // Not provided in API
              createdAt: bet.createdAt,
              settledAt: "", // Not provided in API
              status: bet.status,
              selections: bet.selections.map((selection: any) => ({
                gameId: selection.gameId,
                homeTeam: selection.homeTeam,
                awayTeam: selection.awayTeam,
                betType: selection.marketType,
                selection: selection.outcome,
                odds: selection.odds?.decimal || bet.odds?.decimal,
                stake: bet.stake / bet.selections.length, // Divide stake by number of selections
                potentialWinnings: bet.potentialWinnings,
                result: bet.status,
              })),
              taxPercentage: bet.taxPercentage,
              taxAmount: bet.taxAmount,
              netWinnings: bet.netWinnings,
            });
          }
        });

        setSingleBets(processedSingleBets);
        setMultibets(processedMultibets);
      } else {
        setSingleBets([]);
        setMultibets([]);
      }
    } catch (error: any) {
      console.error("Error loading bet history:", error);
      setBetError(error.message);
      setSingleBets([]);
      setMultibets([]);
    } finally {
      setIsLoadingBets(false);
    }
  };

  const loadBetStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await getBetStatistics();
      setBetStatistics(stats);
    } catch (error: any) {
      console.error("Error loading bet statistics:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleCancelBet = async () => {
    if (!betToCancel) return;

    try {
      await BetHistoryService.cancelBet(betToCancel.id, cancelReason);
      setShowCancelModal(false);
      setBetToCancel(null);
      setCancelReason("");
      // Reload bet history to reflect changes
      loadBetHistory();
    } catch (error: any) {
      console.error("Error cancelling bet:", error);
      alert(`Failed to cancel bet: ${error.message}`);
    }
  };

  const handleSettleBet = async () => {
    if (!betToSettle) return;

    try {
      await BetHistoryService.settleBet(betToSettle.id, settleResult);
      setShowSettleModal(false);
      setBetToSettle(null);
      setSettleResult("won");
      // Reload bet history to reflect changes
      loadBetHistory();
    } catch (error: any) {
      console.error("Error settling bet:", error);
      alert(`Failed to settle bet: ${error.message}`);
    }
  };

  const handleExportHistory = async () => {
    setIsExporting(true);
    try {
      const filters: BetHistoryFilters = {};
      if (betStatusFilter !== "all") {
        filters.status = betStatusFilter as any;
      }
      if (betTypeFilter !== "all") {
        filters.betType = betTypeFilter as any;
      }
      if (dateFrom) {
        filters.dateFrom = dateFrom;
      }
      if (dateTo) {
        filters.dateTo = dateTo;
      }

      const blob = await exportBetHistory(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bet-history-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Error exporting bet history:", error);
      alert(`Failed to export bet history: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Sorting function
  const sortBets = useCallback(
    (bets: any[]) => {
      return [...bets].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === "asc"
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        return 0;
      });
    },
    [sortConfig]
  );

  // Handle sort column click
  const handleSort = (key: keyof any) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Combine single bets and multibets for display
  const allBets = [...singleBets, ...multibets];

  // Filter bets based on search term
  const filteredBets = allBets.filter((bet) => {
    // Status filter
    if (betStatusFilter !== "all" && bet.status !== betStatusFilter)
      return false;

    // Search term filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const hasMatch = bet.selections.some(
        (selection: any) =>
          selection.homeTeam?.toLowerCase().includes(searchLower) ||
          selection.awayTeam?.toLowerCase().includes(searchLower) ||
          selection.selection?.toLowerCase().includes(searchLower) ||
          bet.id.toLowerCase().includes(searchLower)
      );
      if (!hasMatch) return false;
    }

    return true;
  });

  // Sort filtered bets
  const sortedBets = sortBets(filteredBets);

  // Pagination
  const totalPages = Math.ceil(sortedBets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBets = sortedBets.slice(startIndex, endIndex);

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  // Get sort indicator
  const getSortIndicator = (key: keyof any) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const printThermalTicket = (bet: any) => {
    printTicket(bet);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "var(--color-warning)";
      case "accepted":
        return "var(--color-primary)";
      case "rejected":
        return "var(--color-error)";
      case "settled":
        return "var(--color-success)";
      case "cancelled":
        return "var(--color-text-muted)";
      default:
        return "var(--color-text-secondary)";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "accepted":
        return "✅";
      case "rejected":
        return "❌";
      case "settled":
        return "🏆";
      case "cancelled":
        return "🚫";
      default:
        return "❓";
    }
  };

  return (
    <div className="history-page">
      <Header
        onNavigate={onNavigate}
        currentPage="history"
        isAgentMode={false}
      />

      <div className="history-container">
        {/* <div className="page-header">
          <h1>📚 Bet History</h1>
          <p>Track your betting performance and manage your bets</p>
        </div> */}

        {/* Bet Statistics Dashboard */}
        {/* {betStatistics && (
          <div className="stats-dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Bets</h3>
                  <p className="stat-value">{betStatistics.totalBets}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>Total Stake</h3>
                  <p className="stat-value">
                    ${betStatistics.totalStake.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <h3>Total Winnings</h3>
                  <p className="stat-value">
                    ${betStatistics.totalWinnings.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>Win Rate</h3>
                  <p className="stat-value">
                    {(betStatistics.winRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>Avg Odds</h3>
                  <p className="stat-value">
                    {betStatistics.averageOdds.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )} */}

        <div className="bets-tab">
          <div className="tab-header">
            <h2>Bet History</h2>
            <div className="tab-header-actions">
              <button
                className="btn btn-secondary export-btn"
                onClick={handleExportHistory}
                disabled={isExporting}
              >
                {isExporting ? "📥 Exporting..." : "📥 Export CSV"}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <BetsFilters
            betStatusFilter={betStatusFilter}
            setBetStatusFilter={setBetStatusFilter}
            betTypeFilter={betTypeFilter}
            setBetTypeFilter={setBetTypeFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {isLoadingBets ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading bet history...</p>
            </div>
          ) : betError ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error Loading Bets</h3>
              <p>{betError}</p>
              <button className="btn btn-primary" onClick={loadBetHistory}>
                Try Again
              </button>
            </div>
          ) : filteredBets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No Bets Found</h3>
              <p>
                {betStatusFilter === "all"
                  ? "No bets have been placed yet. Click 'Games' to place your first bet."
                  : `No ${betStatusFilter} bets found. Try changing the filter or place a new bet.`}
              </p>
            </div>
          ) : (
            <>
              <HistoryInfo
                totalFiltered={filteredBets.length}
                searchTerm={debouncedSearchTerm}
                betStatusFilter={betStatusFilter}
                betTypeFilter={betTypeFilter}
              />

              <div className="bets-table-container">
                <BetsTableHeader
                  onSort={handleSort}
                  getSortIndicator={getSortIndicator}
                />
                <div className="bets-table-body">
                  {currentBets.map((bet) => (
                    <BetRow
                      key={bet.id}
                      bet={bet}
                      onPrint={printThermalTicket}
                      onView={(b) => {
                        setSelectedBetTicket(b);
                        setShowBetTicket(true);
                      }}
                      onCancel={(b) => {
                        setBetToCancel(b);
                        setShowCancelModal(true);
                      }}
                      onSettle={(b) => {
                        setBetToSettle(b);
                        setShowSettleModal(true);
                      }}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                    />
                  ))}
                </div>
              </div>

              <Pagination
                startIndex={startIndex}
                endIndex={Math.min(endIndex, filteredBets.length)}
                total={filteredBets.length}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={(n) => {
                  setItemsPerPage(n);
                  setCurrentPage(1);
                }}
                goToPrevPage={goToPrevPage}
                goToNextPage={goToNextPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Bet Ticket Modal */}
      {showBetTicket && selectedBetTicket && (
        <BetTicketModal
          bet={selectedBetTicket}
          onClose={() => setShowBetTicket(false)}
          onPrint={(b) => {
            printThermalTicket(b);
            setShowBetTicket(false);
          }}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      )}

      {/* Cancel Bet Modal */}
      {showCancelModal && betToCancel && (
        <div
          className="modal-overlay"
          onClick={() => setShowCancelModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Bet</h3>
              <button
                className="modal-close"
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this bet?</p>
              <div className="bet-summary">
                <strong>Bet ID:</strong> {betToCancel.id}
                <br />
                <strong>Stake:</strong> ${betToCancel.totalStake}
                <br />
                <strong>Potential Winnings:</strong> $
                {betToCancel.potentialWinnings.toFixed(2)}
              </div>
              <div className="form-group">
                <label>Reason for cancellation:</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="form-input"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleCancelBet}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Bet Modal */}
      {showSettleModal && betToSettle && (
        <div
          className="modal-overlay"
          onClick={() => setShowSettleModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Settle Bet</h3>
              <button
                className="modal-close"
                onClick={() => setShowSettleModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Set the result for this bet:</p>
              <div className="bet-summary">
                <strong>Bet ID:</strong> {betToSettle.id}
                <br />
                <strong>Stake:</strong> ${betToSettle.totalStake}
                <br />
                <strong>Potential Winnings:</strong> $
                {betToSettle.potentialWinnings.toFixed(2)}
              </div>
              <div className="form-group">
                <label>Result:</label>
                <select
                  value={settleResult}
                  onChange={(e) =>
                    setSettleResult(e.target.value as "won" | "lost")
                  }
                  className="form-input"
                >
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowSettleModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleSettleBet}>
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
