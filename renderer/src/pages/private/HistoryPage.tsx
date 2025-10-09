import React, { useState, useEffect, useCallback } from "react";
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
  const [bets, setBets] = useState<DisplayBet[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(true);
  const [betError, setBetError] = useState<string | null>(null);
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

  const user = useAppSelector((state) => state.auth.user);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load bet history
  const loadBetHistory = useCallback(async () => {
    if (!user?.shop_id) return;

    setIsLoadingBets(true);
    setBetError(null);

    try {
      const filters: BetHistoryFilters = {
        ...(betStatusFilter !== "all" && {
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
      console.log("Bet history response (new structure):", response);
      console.log("Single bets:", response.data.singleBets);
      console.log("Multibets:", response.data.multibets);

      // Combine single bets and multibets into a single array
      const displayBets = [
        ...response.data.singleBets,
        ...response.data.multibets,
      ];

      console.log("Mapped display bets:", displayBets);
      setBets(displayBets);
      // Note: filteredBets will be set by the client-side filtering useEffect
    } catch (error: any) {
      console.error("Error loading bet history:", error);
      setBetError(error.message || "Failed to load bet history");
    } finally {
      setIsLoadingBets(false);
    }
  }, [user?.shop_id, betStatusFilter, betTypeFilter, dateFrom, dateTo]);

  // Load bet history on component mount and when filters change
  useEffect(() => {
    loadBetHistory();
  }, [loadBetHistory]);

  // Apply client-side filtering
  useEffect(() => {
    let filtered = [...bets];

    // Apply search term filter (first 3 characters match)
    if (debouncedSearchTerm.trim()) {
      const searchTerm = debouncedSearchTerm.trim().toLowerCase();
      filtered = filtered.filter((bet) => {
        // Check if any selection matches the first 3 characters
        return bet.selections.some((selection) => {
          const homeTeam = selection.homeTeam.toLowerCase();
          const awayTeam = selection.awayTeam.toLowerCase();
          const selectionText = selection.selection.toLowerCase();
          const betId = bet.betId.toLowerCase();

          return (
            homeTeam.startsWith(searchTerm) ||
            awayTeam.startsWith(searchTerm) ||
            selectionText.startsWith(searchTerm) ||
            betId.startsWith(searchTerm)
          );
        });
      });
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
      filtered = filtered.filter((bet) => new Date(bet.createdAt) >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((bet) => new Date(bet.createdAt) <= dateTo);
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
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBets = filteredBets.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
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

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadBetHistory();
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
    loadBetHistory();
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
        loadBetHistory();
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
      case "cancelled":
        return "🚫";
      default:
        return "❓";
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
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
          </Typography>
          <Typography variant="body2">
            {filteredBets.length !== bets.length
              ? `Filtered from ${bets.length} total bets`
              : "All bets displayed"}
          </Typography>
        </Alert>

        {/* Loading State */}
        {isLoadingBets ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={48} />
              <Typography variant="h6">Loading bet history...</Typography>
            </Stack>
          </Paper>
        ) : betError ? (
          <Alert
            icon={<IconAlertCircle />}
            severity="error"
            action={
              <Button onClick={loadBetHistory} color="inherit" size="small">
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
