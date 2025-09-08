import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "../../store/hooks";
import { Header } from "../../components/Header";
import { DisplayBet } from "../../types/history";
import { MantineBetTable } from "../../components/history/MantineBetTable";
import { MantineFilters } from "../../components/history/MantineFilters";
import { MantinePagination } from "../../components/history/MantinePagination";
import { BetTicketModal } from "../../components/history/BetTicketModal";
import { HistoryInfo } from "../../components/history/HistoryInfo";
import { Container, Paper, Title, Text, Group, Badge, Stack, Loader, Alert } from "@mantine/core";
import { IconInfoCircle, IconAlertCircle } from "@tabler/icons-react";
import {
  BetHistoryService,
  SingleBet,
  Multibet,
  BetHistoryFilters,
  exportBetHistory,
} from "../../services/betHistoryService";
import { printThermalTicket as printTicket } from "../../services/printService";
import {
  payoutService,
  PayoutRequest,
  PayoutValidationRequest,
} from "../../services/payoutService";

interface HistoryPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

interface SortConfig {
  key: keyof any;
  direction: "asc" | "desc";
}

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
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [betToPayout, setBetToPayout] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "mobile_money" | "bank_transfer" | "card" | "check"
  >("cash");
  const [payoutReference, setPayoutReference] = useState<string>("");
  const [payoutNotes, setPayoutNotes] = useState<string>("");
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [isValidatingPayout, setIsValidatingPayout] = useState(false);
  const [payoutValidationError, setPayoutValidationError] = useState<
    string | null
  >(null);
  const [payoutValidationResult, setPayoutValidationResult] = useState<{
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  } | null>(null);

  // Data state
  const [singleBets, setSingleBets] = useState<DisplayBet[]>([]);
  const [multibets, setMultibets] = useState<DisplayBet[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
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
      // Always include shop bets by default
      filters.includeShopBets = true;

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
        // The API returns separate arrays for singleBets and multibets
        const apiSingleBets = response.data.singleBets || [];
        const apiMultibets = response.data.multibets || [];

        console.log("Backend response data:", response.data);
        console.log("Single bets from backend:", apiSingleBets);
        console.log("Multibets from backend:", apiMultibets);

        // Process single bets
        const processedSingleBets: DisplayBet[] = apiSingleBets.map(
          (bet: any) => ({
            id: bet.betId,
            betType: "single",
            totalStake: bet.stake,
            potentialWinnings: bet.potentialWinnings,
            actualWinnings: bet.actualWinnings || 0,
            createdAt: bet.timestamp,
            settledAt: bet.settledAt || "",
            status: bet.status,
            selections: [
              {
                gameId: bet.gameId,
                homeTeam: bet.homeTeam,
                awayTeam: bet.awayTeam,
                betType: bet.betType,
                selection: bet.selection,
                odds: bet.odds,
                stake: bet.stake,
                potentialWinnings: bet.potentialWinnings,
                result: bet.result || bet.status,
              },
            ],
            taxPercentage: bet.taxPercentage,
            taxAmount: bet.taxAmount,
            netWinnings: bet.netWinnings,
            shop: bet.shop || {
              id: "",
              shopName: "",
              shopCode: "",
              shopAddress: "",
              shopPhone: "",
              shopEmail: "",
              contactPerson: "",
            },
            user: bet.user || {
              id: "",
              phoneNumber: "",
              countryCode: "",
              role: "",
            },
          })
        );

        // Process multibets
        const processedMultibets: DisplayBet[] = apiMultibets.map(
          (bet: any) => ({
            id: bet.betId,
            betType: "multibet",
            totalStake: bet.totalStake,
            potentialWinnings: bet.potentialWinnings,
            actualWinnings: bet.actualWinnings || 0,
            createdAt: bet.timestamp,
            settledAt: bet.settledAt || "",
            status: bet.status,
            selections: bet.bets.map((selection: any) => ({
              gameId: selection.gameId,
              homeTeam: selection.homeTeam,
              awayTeam: selection.awayTeam,
              betType: selection.betType,
              selection: selection.selection,
              odds: selection.odds,
              stake: selection.stake,
              potentialWinnings: selection.potentialWinnings,
              result: bet.result || bet.status,
            })),
            taxPercentage: bet.taxPercentage,
            taxAmount: bet.taxAmount,
            netWinnings: bet.netWinnings,
            shop: bet.shop || {
              id: "",
              shopName: "",
              shopCode: "",
              shopAddress: "",
              shopPhone: "",
              shopEmail: "",
              contactPerson: "",
            },
            user: bet.user || {
              id: "",
              phoneNumber: "",
              countryCode: "",
              role: "",
            },
          })
        );

        console.log("Processed single bets:", processedSingleBets);
        console.log("Processed multibets:", processedMultibets);

        setSingleBets(processedSingleBets);
        setMultibets(processedMultibets);
      } else {
        console.log(
          "No data in response or response not successful:",
          response
        );
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
      // Reload bet history to reflect changes
      loadBetHistory();
    } catch (error: any) {
      console.error("Error settling bet:", error);
      alert(`Failed to settle bet: ${error.message}`);
    }
  };

  const openPayoutModal = async (bet: any) => {
    setBetToPayout(bet);
    setPayoutAmount(bet.actualWinnings || bet.netWinnings || 0);
    setPayoutReference(`PAYOUT_${bet.id}_${Date.now()}`); // Set default reference
    setPayoutValidationError(null);
    setPayoutValidationResult(null);
    setShowPayoutModal(true);

    // Automatically validate when modal opens
    await validatePayoutForModal(bet);
  };

  const validatePayoutForModal = async (bet: any) => {
    setIsValidatingPayout(true);
    setPayoutValidationError(null);

    try {
      console.log("🔄 Auto-validating payout when modal opens...");

      const validationRequest: PayoutValidationRequest = {
        ticketId: bet.id,
        betId: bet.id,
        userId: bet.user?.id || "",
        amount: bet.actualWinnings || bet.netWinnings || 0,
        currency: "SSP",
        paymentMethod: "cash", // Default payment method for validation
        reference: `PAYOUT_${bet.id}_${Date.now()}`,
        notes: `Payout for winning bet ${bet.id}`,
      };

      const validationResult =
        await payoutService.validatePayout(validationRequest);

      console.log("✅ Modal validation result:", validationResult);

      // Store the validation result for display
      setPayoutValidationResult({
        isValid: validationResult.data?.isValid || false,
        warnings: validationResult.data?.warnings || [],
        recommendations: validationResult.data?.recommendations || [],
      });

      if (!validationResult.data?.isValid) {
        const errorMessage =
          validationResult.message || "Payout validation failed";
        const errors = validationResult.errors?.join(", ") || "";
        setPayoutValidationError(
          `${errorMessage}${errors ? `: ${errors}` : ""}`
        );
      }
    } catch (error: any) {
      console.error("❌ Error validating payout in modal:", error);
      setPayoutValidationError(error.message || "Failed to validate payout");
      setPayoutValidationResult({
        isValid: false,
        warnings: [],
        recommendations: [],
      });
    } finally {
      setIsValidatingPayout(false);
    }
  };

  const handlePayoutBet = async () => {
    if (!betToPayout || !payoutValidationResult?.isValid) return;

    // Validate required fields before processing
    if (
      !betToPayout.id ||
      !betToPayout.user?.id ||
      !payoutAmount ||
      !paymentMethod
    ) {
      setPayoutValidationError(
        "Missing required fields: betId, userId, amount, or paymentMethod"
      );
      return;
    }

    setIsProcessingPayout(true);

    try {
      console.log("💰 Processing validated payout...");

      // Process payout using validated data
      const payoutRequest: PayoutRequest = {
        ticketId: betToPayout.id,
        betId: betToPayout.id,
        userId: betToPayout.user.id,
        amount: payoutAmount,
        currency: "SSP", // Required field
        paymentMethod,
        reference: payoutReference || `PAYOUT_${betToPayout.id}_${Date.now()}`, // Ensure reference is not empty
        notes: payoutNotes,
      };

      console.log("📋 Payout request payload:", payoutRequest);

      await payoutService.processPayout(payoutRequest);

      // Success - close modal and reload data
      setShowPayoutModal(false);
      setBetToPayout(null);
      setPayoutAmount(0);
      setPaymentMethod("cash");
      setPayoutReference("");
      setPayoutNotes("");
      setPayoutValidationError(null);
      setPayoutValidationResult(null);

      // Reload bet history to reflect changes
      loadBetHistory();

      console.log("✅ Payout processed successfully!");
    } catch (error: any) {
      console.error("❌ Error processing payout:", error);
      setPayoutValidationError(error.message || "Failed to process payout");
    } finally {
      setIsProcessingPayout(false);
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
      // Always include shop bets in export
      filters.includeShopBets = true;

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

  const printThermalTicket = (bet: any, combinedOdds?: number) => {
    const calculatedOdds = combinedOdds || bet.combinedOdds;
    console.log("📋 HistoryPage calling printTicket with:", {
      bet,
      combinedOdds: calculatedOdds,
      betKeys: Object.keys(bet),
      allOddsFields: {
        combinedOdds: bet.combinedOdds,
        totalOdds: bet.totalOdds,
        odds: bet.odds,
        selections: bet.selections,
      },
    });
    printTicket(bet, calculatedOdds);
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
      case "won":
        return "var(--color-success)";
      case "lost":
        return "var(--color-error)";
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
      case "won":
        return "🎉";
      case "lost":
        return "💔";
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

      <Container size="xl" py="xl">
        {/* Page Header */}
        <Paper p="xl" radius="md" shadow="sm" mb="lg" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}>
          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Title order={1} c="white">
                📚 Bet History
              </Title>
              <Text c="white" opacity={0.9}>
                Track your betting performance and manage all shop bets
              </Text>
            </Stack>
            <Group>
              <Badge size="lg" variant="light" color="white" c="blue">
                {filteredBets.length} bets
              </Badge>
            </Group>
          </Group>
        </Paper>

        {/* Modern Bets Section */}
        <div className="bets-section-modern">
          <div className="section-header-modern">
            <div className="header-left">
              <h2>🎯 Bet History</h2>
              <p className="subtitle">All bets including shop context</p>
            </div>
            <div className="header-right">
              <div className="total-bets-badge">
                <span className="badge-number">{filteredBets.length}</span>
                <span className="badge-label">Total Bets</span>
              </div>
            </div>
          </div>

          {/* Mantine Filters */}
          <MantineFilters
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
            onClearFilters={handleClearFilters}
            onApplyFilters={handleApplyFilters}
            totalBets={bets.length}
            filteredBets={filteredBets.length}
          />

          {/* Loading State */}
          {isLoadingBets ? (
            <Paper p="xl" radius="md" shadow="sm" style={{ textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text size="lg" fw={500}>Loading bet history...</Text>
              </Stack>
            </Paper>
          ) : betError ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error Loading Bets"
              color="red"
              variant="light"
            >
              <Text mb="md">{betError}</Text>
              <button className="btn btn-primary" onClick={loadBetHistory}>
                Try Again
              </button>
            </Alert>
          ) : filteredBets.length === 0 ? (
            <Paper p="xl" radius="md" shadow="sm" style={{ textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <Text size="4xl">🎯</Text>
                <Title order={3}>No Bets Found</Title>
                <Text c="dimmed">
                  {betStatusFilter === "all"
                    ? "No bets have been placed yet. Click 'Games' to place your first bet."
                    : `No ${betStatusFilter} bets found. Try changing the filter or place a new bet.`}
                </Text>
              </Stack>
            </Paper>
          ) : (
            <>
              {/* Enhanced History Info */}
              <div className="history-info-modern">
                <HistoryInfo
                  totalFiltered={filteredBets.length}
                  searchTerm={debouncedSearchTerm}
                  betStatusFilter={betStatusFilter}
                  betTypeFilter={betTypeFilter}
                />
              </div>

              {/* Mantine Bet Table */}
              <MantineBetTable
                bets={currentBets}
                onPrint={printThermalTicket}
                onView={(b) => {
                  setSelectedBetTicket(b);
                  setShowBetTicket(true);
                }}
                onPayout={openPayoutModal}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />

              {/* Mantine Pagination */}
              <MantinePagination
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
                goToPage={goToPage}
              />
            </>
          )}

        {/* Bet Ticket Modal */}
      {showBetTicket && selectedBetTicket && (
        <BetTicketModal
          bet={selectedBetTicket}
          onClose={() => setShowBetTicket(false)}
          onPrint={(b) => {
            console.log("📋 HistoryPage modal calling printTicket with:", {
              bet: b,
              combinedOdds: b["combinedOdds"],
            });
            printThermalTicket(b, b["combinedOdds"]);
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
                <strong>Stake:</strong> SSP{betToCancel.totalStake}
                <br />
                <strong>Potential Winnings:</strong> SSP
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
                <strong>Stake:</strong> SSP{betToSettle.totalStake}
                <br />
                <strong>Potential Winnings:</strong> SSP
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
                onClick={() => setShowCancelModal(false)}
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

      {/* Payout Modal */}
      {showPayoutModal && betToPayout && (
        <div
          className="modal-overlay"
          onClick={() => setShowPayoutModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Process Payout</h3>
              <button
                className="modal-close"
                onClick={() => setShowPayoutModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Process payout for winning bet:</p>
              <div className="bet-summary">
                <strong>Bet ID:</strong> {betToPayout.id}
                <br />
                <strong>Stake:</strong> SSP{betToPayout.totalStake}
                <br />
                <strong>Winnings:</strong> SSP
                {betToPayout.actualWinnings || betToPayout.netWinnings || 0}
                <br />
                <strong>User:</strong>{" "}
                {betToPayout.user?.phoneNumber || "Unknown"}
              </div>

              {/* Validation Status Display */}
              {isValidatingPayout ? (
                <div
                  className="alert alert-info"
                  style={{ marginBottom: "1rem" }}
                >
                  <div className="alert-icon">🔄</div>
                  <div className="alert-content">
                    <strong>Validating Payout...</strong>
                    <p>Please wait while we validate this payout request.</p>
                  </div>
                </div>
              ) : payoutValidationError ? (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: "1rem" }}
                >
                  <div className="alert-icon">❌</div>
                  <div className="alert-content">
                    <strong>Validation Failed:</strong>
                    <p>{payoutValidationError}</p>
                  </div>
                </div>
              ) : payoutValidationResult ? (
                <div
                  className="alert alert-success"
                  style={{ marginBottom: "1rem" }}
                >
                  <div className="alert-icon">✅</div>
                  <div className="alert-content">
                    <strong>Validation Successful</strong>
                    <p>This payout is ready to be processed.</p>
                  </div>
                </div>
              ) : null}

              {/* Warnings Display */}
              {payoutValidationResult?.warnings &&
                payoutValidationResult.warnings.length > 0 && (
                  <div
                    className="alert alert-warning"
                    style={{ marginBottom: "1rem" }}
                  >
                    <div className="alert-icon">⚠️</div>
                    <div className="alert-content">
                      <strong>Warnings:</strong>
                      <ul
                        style={{ margin: "0.5rem 0 0 0", paddingLeft: "1rem" }}
                      >
                        {payoutValidationResult.warnings.map(
                          (warning, index) => (
                            <li key={index}>{warning}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Recommendations Display */}
              {payoutValidationResult?.recommendations &&
                payoutValidationResult.recommendations.length > 0 && (
                  <div
                    className="alert alert-info"
                    style={{ marginBottom: "1rem" }}
                  >
                    <div className="alert-icon">💡</div>
                    <div className="alert-content">
                      <strong>Recommendations:</strong>
                      <ul
                        style={{ margin: "0.5rem 0 0 0", paddingLeft: "1rem" }}
                      >
                        {payoutValidationResult.recommendations.map(
                          (recommendation, index) => (
                            <li key={index}>{recommendation}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              <div className="form-group">
                <label>Payout Amount:</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) =>
                    setPayoutAmount(parseFloat(e.target.value) || 0)
                  }
                  className="form-input"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="form-input"
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference:</label>
                <input
                  type="text"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  className="form-input"
                  placeholder="Payment reference or transaction ID"
                />
              </div>

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="form-input"
                  placeholder="Additional notes about the payout..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowPayoutModal(false);
                  setPayoutValidationError(null);
                  setPayoutValidationResult(null);
                }}
                disabled={isProcessingPayout}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handlePayoutBet}
                disabled={
                  isValidatingPayout ||
                  isProcessingPayout ||
                  !payoutValidationResult?.isValid ||
                  !!payoutValidationError
                }
              >
                {isValidatingPayout ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Validating...
                  </>
                ) : isProcessingPayout ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Processing...
                  </>
                ) : !payoutValidationResult?.isValid ? (
                  "❌ Cannot Process"
                ) : (
                  "💰 Process Payout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </Container>
    </div>
  );
};
