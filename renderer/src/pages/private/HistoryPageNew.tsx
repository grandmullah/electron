import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "../../store/hooks";
import { Header } from "../../components/Header";
import { DisplayBet } from "../../types/history";
import { MantineBetTable } from "../../components/history/MantineBetTable";
import { MantineFilters } from "../../components/history/MantineFilters";
import { MantinePagination } from "../../components/history/MantinePagination";
import { BetTicketModal } from "../../components/history/BetTicketModal";
import { HistoryInfo } from "../../components/history/HistoryInfo";
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Loader,
  Alert,
  Button,
  Box,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconAlertCircle,
  IconDownload,
} from "@tabler/icons-react";
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
  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [betStatusFilter, setBetStatusFilter] = useState("all");
  const [betTypeFilter, setBetTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    if (!user?.shopUserId) return;

    setIsLoadingBets(true);
    setBetError(null);

    try {
      const filters: BetHistoryFilters = {
        shopUserId: user.shopUserId,
        status: betStatusFilter !== "all" ? betStatusFilter : undefined,
        betType: betTypeFilter !== "all" ? betTypeFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: debouncedSearchTerm || undefined,
      };

      const response = await BetHistoryService.getBetHistory(filters);
      const displayBets = response.data.map((bet) => {
        if (bet.betType === "single") {
          const singleBet = bet as SingleBet;
          return {
            id: singleBet.id,
            betType: singleBet.betType,
            totalStake: singleBet.totalStake,
            potentialWinnings: singleBet.potentialWinnings,
            status: singleBet.status,
            createdAt: singleBet.createdAt,
            selections: singleBet.selections.map((sel) => ({
              selection: sel.selection,
              odds: sel.odds,
              homeTeam: sel.homeTeam,
              awayTeam: sel.awayTeam,
            })),
            shop: singleBet.shop,
          } as DisplayBet;
        } else {
          const multibet = bet as Multibet;
          return {
            id: multibet.id,
            betType: multibet.betType,
            totalStake: multibet.totalStake,
            potentialWinnings: multibet.potentialWinnings,
            status: multibet.status,
            createdAt: multibet.createdAt,
            selections: multibet.selections.map((sel) => ({
              selection: sel.selection,
              odds: sel.odds,
              homeTeam: sel.homeTeam,
              awayTeam: sel.awayTeam,
            })),
            shop: multibet.shop,
          } as DisplayBet;
        }
      });

      setBets(displayBets);
      setFilteredBets(displayBets);
    } catch (error: any) {
      console.error("Error loading bet history:", error);
      setBetError(error.message || "Failed to load bet history");
    } finally {
      setIsLoadingBets(false);
    }
  }, [
    user?.shopUserId,
    betStatusFilter,
    betTypeFilter,
    dateFrom,
    dateTo,
    debouncedSearchTerm,
  ]);

  // Load bet history on component mount and when filters change
  useEffect(() => {
    loadBetHistory();
  }, [loadBetHistory]);

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
    setDateFrom("");
    setDateTo("");
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
      "Total Stake",
      "Potential Winnings",
      "Created At",
      "Selections",
    ];

    const rows = bets.map((bet) => [
      bet.id,
      bet.betType,
      bet.status,
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
  const printThermalTicket = (bet: DisplayBet) => {
    console.log("Printing thermal ticket for bet:", bet.id);
    // Implementation for thermal printing
  };

  // Payout handler
  const openPayoutModal = (bet: DisplayBet) => {
    console.log("Opening payout modal for bet:", bet.id);
    // Implementation for payout modal
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

      <Container size="xl" py="xl">
        {/* Page Header */}
        <Paper
          p="xl"
          radius="md"
          shadow="sm"
          mb="lg"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
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
              <Button
                variant="light"
                color="white"
                leftSection={<IconDownload size={16} />}
                onClick={handleExportHistory}
                loading={isExporting}
              >
                Export CSV
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Filters */}
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

        {/* Info Banner */}
        <Alert
          icon={<IconInfoCircle size={16} />}
          title={`Showing ${filteredBets.length} bets`}
          color="blue"
          variant="light"
          mb="lg"
        >
          {filteredBets.length !== bets.length
            ? `Filtered from ${bets.length} total bets`
            : "All bets displayed"}
        </Alert>

        {/* Loading State */}
        {isLoadingBets ? (
          <Paper p="xl" radius="md" shadow="sm" style={{ textAlign: "center" }}>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text size="lg" fw={500}>
                Loading bet history...
              </Text>
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
            <Button onClick={loadBetHistory}>Try Again</Button>
          </Alert>
        ) : filteredBets.length === 0 ? (
          <Paper p="xl" radius="md" shadow="sm" style={{ textAlign: "center" }}>
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
        />
      )}
    </div>
  );
};
