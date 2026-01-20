import React, { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { useAppSelector } from "../../store/hooks";
import { Header } from "../../components/Header";
import { DisplayBet } from "../../types/history";
import { MUIBetTable } from "../../components/history/MUIBetTable";
import { MUIFilters } from "../../components/history/MUIFilters";
import { MUIPagination } from "../../components/history/MUIPagination";
import { BetTicketModal } from "../../components/history/BetTicketModal";
import { PayoutModal } from "../../components/history/PayoutModal";
import { HistoryInfo } from "../../components/history/HistoryInfo";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Info as IconInfoCircle,
  Error as IconAlertCircle,
  Download as IconDownload,
} from "@mui/icons-material";
import "../../styles/mui/history.css";
import {
  BetHistoryService,
  BetHistoryFilters,
} from "../../services/betHistoryService";

interface HistoryPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history",
    params?: { tab?: string; [key: string]: any }
  ) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  // Main bets data is now managed by SWR (defined below)
  const [filteredBets, setFilteredBets] = useState<DisplayBet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showBetTicket, setShowBetTicket] = useState(false);
  const [selectedBetTicket, setSelectedBetTicket] = useState<DisplayBet | null>(
    null
  );
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPayoutBet, setSelectedPayoutBet] = useState<DisplayBet | null>(
    null
  );
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedCancelBet, setSelectedCancelBet] = useState<DisplayBet | null>(
    null
  );
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [betStatusFilter, setBetStatusFilter] = useState("all");
  const [betTypeFilter, setBetTypeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [apiSearchTerm, setApiSearchTerm] = useState<string | null>(null);

  const user = useAppSelector((state) => state.auth.user);

  // Build SWR key for bet history pagination
  const buildBetHistoryKey = () => {
    // Use user.id (not shop_id) so history works for all authenticated users.
    if (!user?.id) return null;

    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", itemsPerPage.toString());

    // Only send API-supported status values. Other statuses (e.g. won/lost) are client-side only.
    const apiSupportedStatuses = new Set([
      "pending",
      "accepted",
      "rejected",
      "settled",
      "cancelled",
    ]);
    if (betStatusFilter !== "all" && apiSupportedStatuses.has(betStatusFilter)) {
      params.append("status", betStatusFilter);
    }
    if (betTypeFilter !== "all") params.append("betType", betTypeFilter);
    if (dateFrom) params.append("dateFrom", dateFrom.toISOString());
    if (dateTo) params.append("dateTo", dateTo.toISOString());

    return `/bet-history/${user.id}?${params.toString()}`;
  };

  // SWR fetcher for bet history
  const betHistoryFetcher = async (key: string) => {
    console.log("📡 [SWR BET HISTORY] Fetching:", key);

    const apiSupportedStatuses = new Set([
      "pending",
      "accepted",
      "rejected",
      "settled",
      "cancelled",
    ]);

    const filters: BetHistoryFilters = {
      page: currentPage,
      limit: itemsPerPage,
      ...(betStatusFilter !== "all" && apiSupportedStatuses.has(betStatusFilter) && {
        status: betStatusFilter as
          | "pending"
          | "accepted"
          | "rejected"
          | "settled"
          | "cancelled",
      }),
      ...(betTypeFilter !== "all" && {
        betType: betTypeFilter as "single" | "multibet",
      }),
      ...(dateFrom && { dateFrom: dateFrom.toISOString() }),
      ...(dateTo && { dateTo: dateTo.toISOString() }),
    };

    const response = await BetHistoryService.getUserBets(filters);
    console.log(
      "✅ [SWR BET HISTORY] Fetched:",
      response.data.total,
      "total bets"
    );

    return response;
  };

  // Use SWR for bet history with pagination
  const {
    data: betHistoryData,
    error: betHistoryError,
    isLoading: isLoadingBets,
    mutate: mutateBetHistory,
  } = useSWR(buildBetHistoryKey(), betHistoryFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000,
    keepPreviousData: true, // Keep showing old data while fetching new page
  });

  // Extract bets from SWR data
  const bets = betHistoryData
    ? [...betHistoryData.data.singleBets, ...betHistoryData.data.multibets]
    : [];

  const betError = betHistoryError?.message || null;

  console.log("📊 [BET HISTORY SWR]", {
    key: buildBetHistoryKey(),
    isLoading: isLoadingBets,
    betsCount: bets.length,
    totalInDB: betHistoryData?.data.total,
    hasError: !!betHistoryError,
  });

  // Debounce search term
  useEffect(() => {
    console.log("⏱️ [DEBOUNCE] Starting timer for:", searchTerm);
    const timer = setTimeout(() => {
      console.log("⏱️ [DEBOUNCE] Timer complete, setting:", searchTerm);
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      console.log("⏱️ [DEBOUNCE] Clearing timer");
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Check if search term is a bet ID (UUID format)
  const isBetIdSearch = (term: string): boolean => {
    const trimmed = term.trim();
    console.log(
      "🔍 [UUID CHECK] Checking:",
      trimmed,
      "Length:",
      trimmed.length
    );

    // Must be at least 8 characters to be considered a UUID
    if (trimmed.length < 8) {
      console.log(
        "🔍 [UUID CHECK] Too short (need 8+ chars), using client-side search"
      );
      return false;
    }

    // Check if it contains only hex characters (and optional hyphens)
    const hexWithDashesRegex = /^[0-9a-f-]+$/i;
    if (!hexWithDashesRegex.test(trimmed)) {
      console.log(
        "🔍 [UUID CHECK] Non-hex characters found, using client-side search"
      );
      return false;
    }

    // UUID format: 8-4-4-4-12 characters
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Also check for partial UUID (at least 8 hex characters with optional structure)
    const partialUuidRegex =
      /^[0-9a-f]{8,}(-[0-9a-f]{4})?(-[0-9a-f]{4})?(-[0-9a-f]{4})?(-[0-9a-f]{0,12})?$/i;

    const isFullMatch = uuidRegex.test(trimmed);
    const isPartialMatch = partialUuidRegex.test(trimmed);
    const result = isFullMatch || isPartialMatch;

    console.log(
      "🔍 [UUID CHECK] Full:",
      isFullMatch,
      "Partial:",
      isPartialMatch,
      "Result:",
      result
    );

    return result;
  };

  // Determine if we should search by bet ID (must be 8+ chars AND look like UUID)
  const shouldSearchById =
    debouncedSearchTerm.trim().length >= 8 &&
    isBetIdSearch(debouncedSearchTerm);
  const betIdToSearch = shouldSearchById ? debouncedSearchTerm.trim() : null;

  console.log("🎯 [DECISION] searchTerm:", searchTerm);
  console.log("🎯 [DECISION] debouncedSearchTerm:", debouncedSearchTerm);
  console.log("🎯 [DECISION] shouldSearchById:", shouldSearchById);
  console.log("🎯 [DECISION] betIdToSearch:", betIdToSearch);
  console.log(
    "🎯 [DECISION] SWR Key:",
    betIdToSearch ? `/bet-search/${betIdToSearch}` : null
  );

  // SWR fetcher for bet details
  const betDetailsFetcher = async (key: string) => {
    console.log("🌐 [FETCHER] CALLED! Key:", key);
    const betId = key.replace("/bet-search/", "");
    console.log("🌐 [FETCHER] Extracted betId:", betId);

    try {
      console.log("🌐 [FETCHER] Calling API...");
      const betDetails = await BetHistoryService.getBetDetails(betId);
      console.log("✅ [FETCHER] SUCCESS:", betDetails);
      return betDetails;
    } catch (error) {
      console.error("❌ [FETCHER] ERROR:", error);
      throw error;
    }
  };

  // Use SWR for bet ID search (8+ hex chars)
  const {
    data: betDetailsData,
    error: betDetailsError,
    isLoading: isSearchingById,
    isValidating,
  } = useSWR(
    betIdToSearch ? `/bet-search/${betIdToSearch}` : null,
    betDetailsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 2000,
      onSuccess: (data) => console.log("✅ [SWR BET ID] onSuccess:", data),
      onError: (err) => console.error("❌ [SWR BET ID] onError:", err),
    }
  );

  // SWR fetcher for general text search (fallback when local search finds nothing)
  const textSearchFetcher = async (key: string) => {
    const searchText = key.replace("/text-search/", "");
    console.log("🌐 [TEXT SEARCH FETCHER] CALLED! Searching for:", searchText);

    try {
      // Use the dedicated search API endpoint
      console.log(
        "🌐 [TEXT SEARCH FETCHER] Calling search API:",
        `/api/bets/search?q=${searchText}&limit=50`
      );
      const results = await BetHistoryService.searchBets(searchText, 50);

      console.log(
        "✅ [TEXT SEARCH FETCHER] API returned:",
        results.length,
        "bets"
      );
      return results;
    } catch (error) {
      console.error("❌ [TEXT SEARCH FETCHER] ERROR:", error);
      throw error;
    }
  };

  // Use SWR for text search (3-7 chars, fallback when local finds nothing)
  const {
    data: textSearchData,
    error: textSearchError,
    isLoading: isSearchingText,
  } = useSWR(
    apiSearchTerm ? `/text-search/${apiSearchTerm}` : null,
    textSearchFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 2000,
      onSuccess: (data) =>
        console.log("✅ [SWR TEXT SEARCH] onSuccess:", data?.length, "bets"),
      onError: (err) => console.error("❌ [SWR TEXT SEARCH] onError:", err),
    }
  );

  console.log("📊 [SWR STATE]", {
    betIdKey: betIdToSearch ? `/bet-search/${betIdToSearch}` : null,
    textSearchKey: apiSearchTerm ? `/text-search/${apiSearchTerm}` : null,
    shouldSearchById,
    betIdToSearch,
    isSearchingById,
    isSearchingText,
    hasBetDetailsData: !!betDetailsData,
    hasTextSearchData: !!textSearchData,
    hasError: !!betDetailsError || !!textSearchError,
  });

  // Apply client-side filtering or use SWR API search results
  useEffect(() => {
    console.log("🔄 [FILTER EFFECT] Running...", {
      shouldSearchById,
      hasDetailsData: !!betDetailsData,
      hasTextSearchData: !!textSearchData,
      debouncedSearchTerm,
    });

    // Priority 1: If searching by bet ID (8+ hex chars) - use bet ID API
    if (shouldSearchById) {
      console.log("🔄 [FILTER EFFECT] Mode: API Bet ID Search");

      if (betDetailsData) {
        console.log("📊 [FILTER EFFECT] Got bet by ID from API");
        const displayBet: DisplayBet = {
          betId: betDetailsData.id || betDetailsData.betId,
          betType: betDetailsData.betType || "single",
          status: betDetailsData.status || "pending",
          totalStake: betDetailsData.totalStake || betDetailsData.stake || 0,
          potentialWinnings:
            betDetailsData.potentialWinnings ||
            betDetailsData.potentialWin ||
            0,
          createdAt:
            betDetailsData.createdAt ||
            betDetailsData.placedAt ||
            new Date().toISOString(),
          selections: betDetailsData.selections || [],
          paymentStatus: betDetailsData.paymentStatus,
          userId: betDetailsData.userId,
        };

        setFilteredBets([displayBet]);
        setCurrentPage(1);
      } else if (betDetailsError) {
        console.error("❌ [FILTER EFFECT] Bet ID API error:", betDetailsError);
        setFilteredBets([]);
      } else {
        console.log("⏳ [FILTER EFFECT] Waiting for bet ID API...");
      }
      return;
    }

    // Priority 2: If we have API text search results (fallback from local search)
    if (textSearchData) {
      console.log("🔄 [FILTER EFFECT] Mode: Using API Text Search Results");
      setFilteredBets(textSearchData);
      setCurrentPage(1);
      return;
    }

    console.log("🔄 [FILTER EFFECT] Mode: Client-side filtering");

    // Priority 3: Client-side filtering
    let filtered = [...bets];

    // Apply search term filter (3+ characters)
    if (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 3) {
      const searchTerm = debouncedSearchTerm.trim().toLowerCase();
      console.log("🔍 [FILTER EFFECT] Filtering locally for:", searchTerm);

      filtered = filtered.filter((bet) => {
        return bet.selections.some((selection) => {
          const homeTeam = selection.homeTeam.toLowerCase();
          const awayTeam = selection.awayTeam.toLowerCase();
          const selectionText = selection.selection.toLowerCase();
          const betId = bet.betId.toLowerCase();

          return (
            homeTeam.startsWith(searchTerm) ||
            awayTeam.startsWith(searchTerm) ||
            selectionText.startsWith(searchTerm) ||
            betId.includes(searchTerm)
          );
        });
      });

      console.log(
        "🔍 [FILTER EFFECT] Local filter found",
        filtered.length,
        "bets"
      );

      // FALLBACK: If local search finds nothing AND we haven't triggered API search yet
      if (filtered.length === 0 && !apiSearchTerm && !isSearchingText) {
        console.log(
          "🔄 [FILTER EFFECT] Local search empty, triggering API fallback search"
        );
        setApiSearchTerm(searchTerm);
        return; // Wait for API results
      }
    } else {
      // Clear API search if search term is cleared or too short
      if (apiSearchTerm) {
        console.log("🔄 [FILTER EFFECT] Clearing API search");
        setApiSearchTerm(null);
      }
    }

    // Apply status filter
    if (betStatusFilter !== "all") {
      filtered = filtered.filter((bet) => bet.status === betStatusFilter);
    }

    // Apply bet type filter
    if (betTypeFilter !== "all") {
      filtered = filtered.filter((bet) => bet.betType === betTypeFilter);
    }

    // Apply payment status filter
    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter((bet) => {
        if (!bet.paymentStatus) {
          return paymentStatusFilter === "no_payout";
        }
        return bet.paymentStatus.status === paymentStatusFilter;
      });
    }

    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(
        (bet) => bet.createdAt && new Date(bet.createdAt) >= dateFrom
      );
    }
    if (dateTo) {
      filtered = filtered.filter(
        (bet) => bet.createdAt && new Date(bet.createdAt) <= dateTo
      );
    }

    setFilteredBets(filtered);
  }, [
    bets,
    debouncedSearchTerm,
    betStatusFilter,
    betTypeFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
    shouldSearchById,
    betDetailsData,
    betDetailsError,
    textSearchData,
    apiSearchTerm,
    isSearchingText,
  ]);

  // Reset API search term when debounced search term changes
  useEffect(() => {
    if (
      apiSearchTerm &&
      debouncedSearchTerm.trim().toLowerCase() !== apiSearchTerm
    ) {
      console.log("🔄 [RESET] Clearing API search due to search term change");
      setApiSearchTerm(null);
    }
  }, [debouncedSearchTerm, apiSearchTerm]);

  // Pagination calculations
  // For server-side pagination: use total from API response
  // For client-side filtering (search): use filteredBets length
  const isSearchActive = debouncedSearchTerm.trim().length > 0;
  const totalBetsCount = isSearchActive
    ? filteredBets.length // Client-side search: use filtered results
    : betHistoryData?.data.total || 0; // Server-side: use API total

  const totalPages = Math.max(1, Math.ceil(totalBetsCount / itemsPerPage));
  const startIndex = totalBetsCount === 0 ? 0 : (currentPage - 1) * itemsPerPage;

  // For server-side pagination: `filteredBets` is already a single page from the API.
  // For search (client-side / search endpoints): paginate locally.
  const currentBets = isSearchActive
    ? filteredBets.slice(startIndex, startIndex + itemsPerPage)
    : filteredBets;

  const endIndex =
    totalBetsCount === 0 ? 0 : Math.min(startIndex + currentBets.length, totalBetsCount);

  console.log("📄 [PAGINATION CALC]", {
    isSearchActive,
    totalBetsCount,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredBetsLength: filteredBets.length,
    apiTotal: betHistoryData?.data.total,
  });

  // Pagination handlers - trigger API reload when page changes
  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    console.log("📄 [PAGINATION] Going to page:", newPage);
    setCurrentPage(newPage);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => {
      const newPage = Math.max(1, prev - 1);
      console.log("📄 [PAGINATION] Previous page:", newPage);
      return newPage;
    });
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => {
      const newPage = Math.min(totalPages, prev + 1);
      console.log("📄 [PAGINATION] Next page:", newPage);
      return newPage;
    });
  };

  // Filter handlers
  const handleClearFilters = () => {
    setBetStatusFilter("all");
    setBetTypeFilter("all");
    setPaymentStatusFilter("all");
    setDateFrom(null);
    setDateTo(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  // If server-side filters change while on a later page, reset to page 1 to avoid empty pages.
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betStatusFilter, betTypeFilter, dateFrom, dateTo, itemsPerPage]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    // SWR will automatically refetch when key changes
  };

  // Export handler
  const handleExportHistory = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV(filteredBets);
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bet-history-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting history:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // CSV generation
  const generateCSV = (bets: DisplayBet[]) => {
    const headers = [
      "Bet ID",
      "Type",
      "Status",
      "Payment Status",
      "Payout ID",
      "Payment Amount",
      "Payment Method",
      "Total Stake",
      "Potential Winnings",
      "Created At",
      "Selections",
    ];

    const rows = bets.map((bet) => [
      bet.betId,
      bet.betType,
      bet.status,
      bet.paymentStatus?.status || "No payment info",
      bet.paymentStatus?.payoutId || "",
      bet.paymentStatus?.payoutAmount || "",
      bet.paymentStatus?.paymentMethod || "",
      bet.totalStake,
      bet.potentialWinnings,
      bet.createdAt,
      bet.selections.map((s) => `${s.selection} (${s.odds}x)`).join("; "),
    ]);

    return [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");
  };

  // Print handler
  const printThermalTicket = async (bet: DisplayBet) => {
    console.log("Printing thermal ticket for bet:", bet.betId);
    try {
      const { printThermalTicket: printTicket } = await import(
        "../../services/printService"
      );
      // Pass user data from Redux store to print service
      await printTicket(bet, user);
    } catch (error) {
      console.error("Error importing print service:", error);
      alert("Error: Unable to load print service. Please try again.");
    }
  };

  // Payout handler
  const openPayoutModal = (bet: DisplayBet) => {
    console.log("Opening payout modal for bet:", bet.betId);
    setSelectedPayoutBet(bet);
    setShowPayoutModal(true);
  };

  const handlePayoutComplete = () => {
    // Refresh the bet history to reflect the payout completion
    mutateBetHistory(); // Revalidate SWR cache
    setShowPayoutModal(false);
    setSelectedPayoutBet(null);
  };

  // Handle cancel bet dialog
  const handleCancelBet = (bet: DisplayBet) => {
    setSelectedCancelBet(bet);
    setCancelError(null);
    setCancelSuccess(null);
    setShowCancelDialog(true);
  };

  // Confirm cancel bet
  const confirmCancelBet = async () => {
    if (!selectedCancelBet) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      const response = await BetHistoryService.cancelBet(
        selectedCancelBet.betId
      );

      if (response.success) {
        setCancelSuccess(response.message || "Bet cancelled successfully");
        // Refresh the bet history
        mutateBetHistory(); // Revalidate SWR cache
        // Close dialog after a short delay
        setTimeout(() => {
          setShowCancelDialog(false);
          setSelectedCancelBet(null);
          setCancelSuccess(null);
        }, 2000);
      } else {
        setCancelError(response.message || "Failed to cancel bet");
      }
    } catch (error: any) {
      console.error("Error cancelling bet:", error);
      setCancelError(
        error.message || "An error occurred while cancelling the bet"
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Status helpers
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
        return "success";
      case "lost":
        return "error";
      case "pending":
        return "warning";
      case "accepted":
        return "info";
      case "cancelled":
        return "gray";
      default:
        return "blue";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
        return "✅";
      case "lost":
        return "❌";
      case "pending":
        return "⏳";
      case "accepted":
        return "🟦";
      case "cancelled":
        return "🚫";
      default:
        return "❓";
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        pb: 4,
      }}
    >
      <Header
        onNavigate={onNavigate}
        currentPage="history"
        isAgentMode={false}
      />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}

        {/* Filters */}
        <MUIFilters
          betStatusFilter={betStatusFilter}
          setBetStatusFilter={setBetStatusFilter}
          betTypeFilter={betTypeFilter}
          setBetTypeFilter={setBetTypeFilter}
          paymentStatusFilter={paymentStatusFilter}
          setPaymentStatusFilter={setPaymentStatusFilter}
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

        {/* Info Banner */}
        <Alert icon={<IconInfoCircle />} severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            Showing {filteredBets.length} bets
            {isSearchingById && " (Searching by bet ID...)"}
          </Typography>
          <Typography variant="body2">
            {isSearchingById
              ? "Looking up bet details from API..."
              : filteredBets.length !== bets.length
                ? `Filtered from ${bets.length} total bets`
                : "All bets displayed"}
          </Typography>
        </Alert>

        {/* Loading State */}
        {isLoadingBets || isSearchingById || isSearchingText ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={48} />
              <Typography variant="h6">
                {isSearchingById
                  ? "Searching for bet by ID..."
                  : isSearchingText
                    ? "Searching API for matches..."
                    : "Loading bet history..."}
              </Typography>
            </Stack>
          </Paper>
        ) : betError ? (
          <Alert
            icon={<IconAlertCircle />}
            severity="error"
            action={
              <Button
                onClick={() => mutateBetHistory()}
                color="inherit"
                size="small"
              >
                Try Again
              </Button>
            }
          >
            <Typography variant="subtitle2" gutterBottom>
              Error Loading Bets
            </Typography>
            <Typography variant="body2">{betError}</Typography>
          </Alert>
        ) : filteredBets.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Stack alignItems="center" spacing={2}>
              <Typography variant="h1">🎯</Typography>
              <Typography variant="h4">No Bets Found</Typography>
              <Typography color="text.secondary">
                {betStatusFilter === "all"
                  ? "No bets have been placed yet. Click 'Games' to place your first bet."
                  : `No ${betStatusFilter} bets found. Try changing the filter or place a new bet.`}
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <>
            {/* MUI Bet Table */}
            <MUIBetTable
              bets={currentBets}
              onPrint={printThermalTicket}
              onView={(b) => {
                setSelectedBetTicket(b);
                setShowBetTicket(true);
              }}
              onPayout={openPayoutModal}
              onCancel={handleCancelBet}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />

            {/* MUI Pagination */}
            <MUIPagination
              startIndex={startIndex}
              endIndex={endIndex}
              total={totalBetsCount}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={(n) => {
                console.log("📄 [PAGINATION] Changing items per page to:", n);
                setItemsPerPage(n);
                setCurrentPage(1); // Reset to page 1 when changing page size
              }}
              goToPrevPage={goToPrevPage}
              goToNextPage={goToNextPage}
              goToPage={goToPage}
            />
          </>
        )}
      </Container>

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

      {/* Payout Modal */}
      {showPayoutModal && selectedPayoutBet && (
        <PayoutModal
          open={showPayoutModal}
          onClose={() => {
            setShowPayoutModal(false);
            setSelectedPayoutBet(null);
          }}
          bet={selectedPayoutBet}
          onPayoutComplete={handlePayoutComplete}
          onNavigateToDashboard={() => {
            setShowPayoutModal(false);
            setSelectedPayoutBet(null);
            onNavigate("dashboard", { tab: "payout" });
          }}
        />
      )}

      {/* Cancel Bet Confirmation Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => !isCancelling && setShowCancelDialog(false)}
        PaperProps={{
          sx: {
            background: "rgba(26, 26, 46, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 0,
            color: "white",
          },
        }}
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(229, 57, 53, 0.15) 100%)",
            borderBottom: "1px solid rgba(244, 67, 54, 0.3)",
          }}
        >
          Cancel Bet
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ color: "rgba(255,255,255,0.8)", mb: 2 }}>
            Are you sure you want to cancel this bet?
          </DialogContentText>
          {selectedCancelBet && (
            <Box
              sx={{
                p: 2,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 0,
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Bet ID:</strong> {selectedCancelBet.betId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Type:</strong> {selectedCancelBet.betType}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Stake:</strong> SSP{" "}
                {selectedCancelBet.totalStake?.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong>{" "}
                <Chip
                  label={selectedCancelBet.status}
                  size="small"
                  sx={{
                    backgroundColor: getStatusColor(selectedCancelBet.status),
                    color: "white",
                  }}
                />
              </Typography>
            </Box>
          )}
          {cancelError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {cancelError}
            </Alert>
          )}
          {cancelSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {cancelSuccess}
            </Alert>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            p: 2,
          }}
        >
          <Button
            onClick={() => setShowCancelDialog(false)}
            disabled={isCancelling}
            sx={{
              color: "rgba(255,255,255,0.7)",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            Close
          </Button>
          <Button
            onClick={confirmCancelBet}
            disabled={isCancelling || !!cancelSuccess}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #f44336 0%, #e53935 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #e53935 0%, #d32f2f 100%)",
              },
              "&:disabled": {
                background: "rgba(244, 67, 54, 0.3)",
              },
            }}
          >
            {isCancelling ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Confirm Cancel"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
