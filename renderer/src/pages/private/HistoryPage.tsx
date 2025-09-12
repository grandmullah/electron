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
} from "@mui/material";
import {
  Info as IconInfoCircle,
  Error as IconAlertCircle,
  Download as IconDownload,
} from "@mui/icons-material";
import "../../styles/mui/history.css";
import {
  BetHistoryService,
  SingleBet,
  Multibet,
  BetHistoryFilters,
} from "../../services/betHistoryService";

interface HistoryPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
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
      console.log("Bet history response:", response);
      console.log("Single bets:", response.data.singleBets);
      console.log("Multibets:", response.data.multibets);

      const displayBets = response.data.singleBets
        .map(
          (bet) =>
            ({
              id: bet.betId,
              betType: "single" as const,
              totalStake: bet.stake,
              potentialWinnings: bet.potentialWinnings,
              actualWinnings: bet.actualWinnings || 0,
              createdAt: bet.timestamp,
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
                  result: bet.result || "pending",
                },
              ],
              shop: {
                id: bet.shopId,
                shopName: "Unknown Shop",
                shopCode: bet.shopId,
              },
              user: {
                id: bet.userId,
                phoneNumber: bet.userInfo?.phoneNumber || "",
                countryCode: "+211",
                role: "user",
              },
              paymentStatus: bet.paymentStatus,
            }) as DisplayBet
        )
        .concat(
          response.data.multibets.map(
            (bet) =>
              ({
                id: bet.betId,
                betType: "multibet" as const,
                totalStake: bet.totalStake,
                potentialWinnings: bet.potentialWinnings,
                actualWinnings: bet.actualWinnings || 0,
                createdAt: bet.timestamp,
                status: bet.status,
                selections: bet.bets.map((b) => ({
                  gameId: b.gameId,
                  homeTeam: b.homeTeam,
                  awayTeam: b.awayTeam,
                  betType: b.betType,
                  selection: b.selection,
                  odds: b.odds,
                  stake: b.stake,
                  potentialWinnings: b.potentialWinnings,
                  result: "pending",
                })),
                shop: {
                  id: bet.shopId,
                  shopName: "Unknown Shop",
                  shopCode: bet.shopId,
                },
                user: {
                  id: bet.userId,
                  phoneNumber: bet.userInfo?.phoneNumber || "",
                  countryCode: "+211",
                  role: "user",
                },
                paymentStatus: bet.paymentStatus,
              }) as DisplayBet
          )
        );

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
          const betId = bet.id.toLowerCase();

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
      bet.id,
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
    console.log("Printing thermal ticket for bet:", bet.id);
    try {
      const { printThermalTicket: printTicket } = await import(
        "../../services/printService"
      );
      await printTicket(bet);
    } catch (error) {
      console.error("Error importing print service:", error);
      alert("Error: Unable to load print service. Please try again.");
    }
  };

  // Payout handler
  const openPayoutModal = (bet: DisplayBet) => {
    console.log("Opening payout modal for bet:", bet.id);
    setSelectedPayoutBet(bet);
    setShowPayoutModal(true);
  };

  const handlePayoutComplete = () => {
    // Refresh the bet history to reflect the payout completion
    loadBetHistory();
    setShowPayoutModal(false);
    setSelectedPayoutBet(null);
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
    <div className="history-page">
      <Header
        onNavigate={onNavigate}
        currentPage="history"
        isAgentMode={false}
      />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
            color: "white",
            border: "1px solid #2a2d3a",
            borderRadius: "16px",
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack spacing={1}>
              <Typography variant="h3" color="white">
                📚 Bet History
              </Typography>
              <Typography color="white" sx={{ opacity: 0.9 }}>
                Track your betting performance and manage all shop bets
              </Typography>
            </Stack>
            <Box display="flex" gap={2} alignItems="center">
              <Chip
                label={`${filteredBets.length} bets`}
                color="primary"
                variant="outlined"
                sx={{ color: "white", borderColor: "white" }}
              />
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<IconDownload />}
                onClick={handleExportHistory}
                disabled={isExporting}
                sx={{ color: "white", borderColor: "white" }}
              >
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </Box>
          </Box>
        </Paper>

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
        />
      )}
    </div>
  );
};
