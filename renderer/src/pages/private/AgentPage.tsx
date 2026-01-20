import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  setLoading,
  setError,
  setAgentBets,
  setAgentStats,
  AgentBet,
  setManagedAgents,
  ManagedAgent,
} from "../../store/agentSlice";
import AgentService from "../../services/agentService";
import { Header } from "../../components/Header";
import { SendMoneyModal } from "../../components/SendMoneyModal";
import { MintBalanceModal } from "../../components/MintBalanceModal";
import { CreateAgentModal } from "../../components/CreateAgentModal";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Divider,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import {
  SportsSoccer as BetsIcon,
  AttachMoney as MoneyIcon,
  Assessment as StatsIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Print as PrintIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as BalanceIcon,
  Store as StoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";

interface AgentPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

export const AgentPage: React.FC<AgentPageProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    agentBets,
    isLoading,
    error,
    totalCommission,
    totalBetsPlaced,
    totalStake,
    managedAgents,
  } = useAppSelector((state) => state.agent);

  const [activeTab, setActiveTab] = useState<
    "bets" | "sendMoney" | "stats" | "agents" | "balance" | "analytics"
  >("bets");
  const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
  const [betStatusFilter, setBetStatusFilter] = useState<
    "all" | "pending" | "accepted" | "settled"
  >("all");
  const [expandedBets, setExpandedBets] = useState<Set<string>>(new Set());
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [showMintBalanceModal, setShowMintBalanceModal] = useState(false);
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<ManagedAgent | null>(null);
  const [shopAnalytics, setShopAnalytics] = useState<any>(null);
  const [selectedBetTicket, setSelectedBetTicket] = useState<AgentBet | null>(
    null
  );

  const isAdmin = user?.role === "admin";
  const isAgentRole =
    user?.role === "agent" || user?.role === "super_agent" || user?.role === "admin";
  const isSuperAgent = user?.role === "super_agent";
  
  // Debug logging
  useEffect(() => {
    console.log("AgentPage - User role:", user?.role);
    console.log("AgentPage - isSuperAgent:", isSuperAgent);
    console.log("AgentPage - activeTab:", activeTab);
    console.log("AgentPage - Should show Agents tab:", isSuperAgent);
    console.log("AgentPage - Should show Create Agent button:", activeTab === "agents" && isSuperAgent);
  }, [user?.role, isSuperAgent, activeTab]);

  if (!isAgentRole) {
    return (
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            textAlign: "center",
            maxWidth: 500,
          }}
        >
          <CancelIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom color="text.primary">
            Access Denied
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            You need agent or super agent privileges to access this page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => onNavigate("home")}
          >
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  useEffect(() => {
    loadAgentData();
  }, [activeTab, betStatusFilter]);

  const loadAgentData = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Admins can view this page, but agent-only data/actions are not guaranteed to apply.
      // Avoid firing agent endpoints for admins by default.
      if (isAdmin) {
        return;
      }

      if (activeTab === "agents" && isSuperAgent) {
        try {
          const agents = await AgentService.getShopAgents();
          dispatch(setManagedAgents(agents));
        } catch (error: any) {
          console.error("Failed to load managed agents:", error);
          dispatch(setError(`Failed to load managed agents: ${error.message}`));
        }
      } else if (activeTab === "bets") {
        try {
          const statusParam =
            betStatusFilter === "all" ? undefined : betStatusFilter;
          const bets = await AgentService.getAgentBets(statusParam);
          dispatch(setAgentBets(bets));

          // Calculate stats
          const stats = {
            totalCommission: 0,
            totalBetsPlaced: bets.length,
            totalStake: bets.reduce((sum, bet) => sum + bet.totalStake, 0),
          };
          dispatch(setAgentStats(stats));
        } catch (error: any) {
          console.error("Failed to load agent bets:", error);
          dispatch(setError(`Failed to load bets: ${error.message}`));
        }
      } else if (activeTab === "balance") {
        try {
          const history = await AgentService.getBalanceHistory(50);
          setBalanceHistory(history);
        } catch (error: any) {
          console.error("Failed to load balance history:", error);
          dispatch(
            setError(`Failed to load balance history: ${error.message}`)
          );
        }
      } else if (activeTab === "analytics" && isSuperAgent) {
        try {
          const analytics = await AgentService.getShopAnalytics();
          console.log("Shop analytics received in AgentPage:", analytics);
          setShopAnalytics(analytics);
        } catch (error: any) {
          console.error("Failed to load shop analytics:", error);
          dispatch(setError(`Failed to load shop analytics: ${error.message}`));
        }
      }
    } catch (error: any) {
      console.error("Error in loadAgentData:", error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const toggleBetExpansion = (betId: string) => {
    setExpandedBets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(betId)) {
        newSet.delete(betId);
      } else {
        newSet.add(betId);
      }
      return newSet;
    });
  };

  const printThermalTicket = async (bet: AgentBet) => {
    const calculatedOdds =
      (bet as any).combinedOdds ||
      (bet.selections?.length > 0
        ? bet.selections.reduce((total, selection) => total * selection.odds, 1)
        : undefined);

    try {
      const { printThermalTicket: printTicket } = await import(
        "../../services/printService"
      );
      await printTicket(bet, calculatedOdds);
    } catch (error) {
      console.error("Error printing ticket:", error);
      alert("Error: Unable to print ticket. Please try again.");
    }
  };

  const getStatusColor = (
    status: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (status.toLowerCase()) {
      case "won":
      case "accepted":
        return "success";
      case "lost":
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      case "settled":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
      case "accepted":
        return <CheckCircleIcon />;
      case "lost":
      case "rejected":
        return <CancelIcon />;
      case "pending":
        return <ScheduleIcon />;
      default:
        return null;
    }
  };

  const handleSendMoneySuccess = (newBalance: number) => {
    // Update user balance in the UI
    setShowSendMoneyModal(false);
    loadAgentData();
  };

  const handleMintBalanceSuccess = (agentId: string, newBalance: number) => {
    // Update agent balance in the list
    setShowMintBalanceModal(false);
    setSelectedAgent(null);
    // Refresh agents list to show updated balance
    loadAgentData();
  };

  const handleCreateAgentSuccess = (agent: ManagedAgent) => {
    // Refresh agents list to show new agent
    setShowCreateAgentModal(false);
    loadAgentData();
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Header onNavigate={onNavigate} currentPage="agent" />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {isAdmin && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Admin account detected. This page is primarily for shop agents/super agents; use the{" "}
            <Button
              variant="text"
              onClick={() => onNavigate("management")}
              sx={{ textTransform: "none", p: 0, minWidth: "auto" }}
            >
              Management
            </Button>{" "}
            page for admin operations.
          </Alert>
        )}
        {/* Page Header */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                👨‍💼 {isSuperAgent ? "Super Agent" : "Agent"} Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage walk-in clients, shop bets, and money transfers
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setShowSendMoneyModal(true)}
                color="success"
              >
                Send Money
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadAgentData}
                disabled={isLoading}
                sx={{
                  borderColor: "divider",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "text.primary",
                    bgcolor: "action.hover",
                  },
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Balance
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {user?.currency} {user?.balance.toFixed(2)}
                    </Typography>
                  </Box>
                  <BalanceIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "white",
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      Total Bets
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {totalBetsPlaced}
                    </Typography>
                  </Box>
                  <BetsIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "white",
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      Total Stake
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {user?.currency} {totalStake.toFixed(2)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                color: "white",
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      Shop
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {user?.shop?.shop_name || "N/A"}
                    </Typography>
                  </Box>
                  <StoreIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tab Navigation */}
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            textColor="inherit"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                color: "rgba(255,255,255,0.7)",
                "&.Mui-selected": {
                  color: "white",
                },
              },
            }}
          >
            <Tab icon={<BetsIcon />} label="Shop Bets" value="bets" />
            <Tab icon={<MoneyIcon />} label="Balance History" value="balance" />
            {isSuperAgent && (
              <Tab icon={<PeopleIcon />} label="Agents" value="agents" />
            )}
            {isSuperAgent && (
              <Tab icon={<TrendingUpIcon />} label="Shop Analytics" value="analytics" />
            )}
            <Tab icon={<StatsIcon />} label="Statistics" value="stats" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Bets Tab */}
            {activeTab === "bets" && (
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Shop Bets
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {["all", "pending", "accepted", "settled"].map((status) => (
                      <Chip
                        key={status}
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        onClick={() =>
                          setBetStatusFilter(
                            status as "all" | "pending" | "accepted" | "settled"
                          )
                        }
                        color={
                          betStatusFilter === status ? "primary" : "default"
                        }
                        sx={{
                          color: "white",
                          borderColor:
                            betStatusFilter === status
                              ? undefined
                              : "rgba(255,255,255,0.3)",
                        }}
                        variant={
                          betStatusFilter === status ? "filled" : "outlined"
                        }
                      />
                    ))}
                  </Stack>
                </Stack>

                {agentBets.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <ReceiptIcon
                      sx={{
                        fontSize: 80,
                        color: "rgba(255,255,255,0.3)",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" color="rgba(255,255,255,0.7)">
                      No bets found
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.5)">
                      Shop bets will appear here once placed
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<BetsIcon />}
                      onClick={() => onNavigate("games")}
                      sx={{
                        mt: 3,
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      }}
                    >
                      Place a Bet
                    </Button>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Ticket #
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Type
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Stake
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Potential Win
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Date
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {agentBets.map((bet) => {
                          const isExpanded = expandedBets.has(bet.id);
                          const combinedOdds =
                            (bet as any).combinedOdds ||
                            bet.selections?.reduce(
                              (acc, sel) => acc * sel.odds,
                              1
                            ) ||
                            1;
                          const potentialWin = bet.totalStake * combinedOdds;

                          return (
                            <React.Fragment key={bet.id}>
                              <TableRow
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                  },
                                }}
                              >
                                <TableCell sx={{ color: "white" }}>
                                  {bet.ticketNumber || bet.id.slice(0, 8)}
                                </TableCell>
                                <TableCell sx={{ color: "white" }}>
                                  <Chip
                                    label={
                                      bet.selections?.length === 1
                                        ? "Single"
                                        : `Multi (${bet.selections?.length})`
                                    }
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        "rgba(66, 165, 245, 0.2)",
                                      color: "#42a5f5",
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ color: "white" }}>
                                  {user?.currency} {bet.totalStake.toFixed(2)}
                                </TableCell>
                                <TableCell sx={{ color: "white" }}>
                                  {user?.currency} {potentialWin.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={getStatusIcon(bet.status)}
                                    label={bet.status}
                                    color={getStatusColor(bet.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell
                                  sx={{ color: "rgba(255,255,255,0.7)" }}
                                >
                                  {new Date(bet.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={1}>
                                    <Tooltip title="View Details">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          toggleBetExpansion(bet.id)
                                        }
                                        sx={{ color: "white" }}
                                      >
                                        {isExpanded ? (
                                          <ExpandLessIcon />
                                        ) : (
                                          <ExpandMoreIcon />
                                        )}
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Print Ticket">
                                      <IconButton
                                        size="small"
                                        onClick={() => printThermalTicket(bet)}
                                        sx={{ color: "white" }}
                                      >
                                        <PrintIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  sx={{ py: 0, border: "none" }}
                                >
                                  <Collapse in={isExpanded}>
                                    <Box sx={{ p: 2 }}>
                                      <Typography
                                        variant="subtitle2"
                                        gutterBottom
                                        color="rgba(255,255,255,0.9)"
                                      >
                                        Selections:
                                      </Typography>
                                      <Stack spacing={1}>
                                        {bet.selections?.map(
                                          (selection, idx) => (
                                            <Paper
                                              key={idx}
                                              sx={{
                                                p: 2,
                                                background:
                                                  "rgba(255,255,255,0.05)",
                                                border:
                                                  "1px solid rgba(255,255,255,0.1)",
                                              }}
                                            >
                                              <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                  <Typography
                                                    variant="body2"
                                                    color="white"
                                                    fontWeight="bold"
                                                  >
                                                    {selection.homeTeam} vs{" "}
                                                    {selection.awayTeam}
                                                  </Typography>
                                                  <Typography
                                                    variant="caption"
                                                    color="rgba(255,255,255,0.6)"
                                                  >
                                                    {selection.betType}
                                                  </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                  <Typography
                                                    variant="caption"
                                                    color="rgba(255,255,255,0.6)"
                                                  >
                                                    Selection
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    color="white"
                                                  >
                                                    {selection.selection}
                                                  </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                  <Typography
                                                    variant="caption"
                                                    color="rgba(255,255,255,0.6)"
                                                  >
                                                    Odds
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    color="#42a5f5"
                                                    fontWeight="bold"
                                                  >
                                                    {selection.odds.toFixed(2)}
                                                  </Typography>
                                                </Grid>
                                              </Grid>
                                            </Paper>
                                          )
                                        )}
                                      </Stack>
                                      <Divider
                                        sx={{
                                          my: 2,
                                          borderColor: "rgba(255,255,255,0.1)",
                                        }}
                                      />
                                      <Grid container spacing={2}>
                                        <Grid item xs={6} sm={3}>
                                          <Typography
                                            variant="caption"
                                            color="rgba(255,255,255,0.6)"
                                          >
                                            Combined Odds
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            color="white"
                                            fontWeight="bold"
                                          >
                                            {combinedOdds.toFixed(2)}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                          <Typography
                                            variant="caption"
                                            color="rgba(255,255,255,0.6)"
                                          >
                                            Stake
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            color="white"
                                            fontWeight="bold"
                                          >
                                            {user?.currency}{" "}
                                            {bet.totalStake.toFixed(2)}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                          <Typography
                                            variant="caption"
                                            color="rgba(255,255,255,0.6)"
                                          >
                                            Potential Win
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            color="#10b981"
                                            fontWeight="bold"
                                          >
                                            {user?.currency}{" "}
                                            {potentialWin.toFixed(2)}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                          <Typography
                                            variant="caption"
                                            color="rgba(255,255,255,0.6)"
                                          >
                                            Customer
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            color="white"
                                          >
                                            Walk-in
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            )}

            {/* Balance History Tab */}
            {activeTab === "balance" && (
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Balance History
                </Typography>

                {balanceHistory.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <MoneyIcon
                      sx={{
                        fontSize: 80,
                        color: "rgba(255,255,255,0.3)",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" color="rgba(255,255,255,0.7)">
                      No transactions found
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.5)">
                      Your balance transactions will appear here
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Date
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Type
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Amount
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Balance Before
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Balance After
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Description
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {balanceHistory.map((transaction, idx) => {
                          const isPositive = transaction.amount >= 0;
                          return (
                            <TableRow
                              key={transaction.id || idx}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(255,255,255,0.05)",
                                },
                              }}
                            >
                              <TableCell
                                sx={{ color: "rgba(255,255,255,0.7)" }}
                              >
                                {new Date(
                                  transaction.created_at
                                ).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={transaction.type}
                                  color={
                                    transaction.type === "deposit"
                                      ? "success"
                                      : transaction.type === "withdrawal"
                                        ? "error"
                                        : "default"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: isPositive ? "#10b981" : "#ef4444",
                                  fontWeight: "bold",
                                }}
                              >
                                {isPositive ? "+" : ""}
                                {user?.currency} {transaction.amount.toFixed(2)}
                              </TableCell>
                              <TableCell sx={{ color: "white" }}>
                                {user?.currency}{" "}
                                {transaction.balance_before?.toFixed(2) ||
                                  "N/A"}
                              </TableCell>
                              <TableCell sx={{ color: "white" }}>
                                {user?.currency}{" "}
                                {transaction.balance_after?.toFixed(2) || "N/A"}
                              </TableCell>
                              <TableCell
                                sx={{ color: "rgba(255,255,255,0.7)" }}
                              >
                                {transaction.description || "N/A"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            )}

            {/* Agents Tab (Super Agent only) */}
            {activeTab === "agents" && isSuperAgent && (
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Shop Users ({managedAgents.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setShowCreateAgentModal(true)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
                      color: "white",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                      },
                    }}
                  >
                    Create Agent
                  </Button>
                </Box>

                {managedAgents.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <PeopleIcon
                      sx={{
                        fontSize: 80,
                        color: "rgba(255,255,255,0.3)",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" color="rgba(255,255,255,0.7)">
                      No users found
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.5)">
                      Users in your shop will appear here
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Phone Number
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Role
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Balance
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Created
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {managedAgents.map((agent) => (
                          <TableRow
                            key={agent.id}
                            sx={{
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.05)",
                              },
                            }}
                          >
                            <TableCell sx={{ color: "white" }}>
                              {agent.phone_number}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={agent.role}
                                color={
                                  agent.role === "super_agent"
                                    ? "secondary"
                                    : "primary"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {user?.currency || "SSP"} {agent.balance.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={agent.isActive ? "Active" : "Inactive"}
                                color={agent.isActive ? "success" : "default"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                              {new Date(agent.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {agent.role === "agent" ? (
                                <Tooltip title="Mint Balance">
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<MoneyIcon />}
                                    onClick={() => {
                                      setSelectedAgent(agent);
                                      setShowMintBalanceModal(true);
                                    }}
                                    sx={{
                                      background:
                                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                      color: "white",
                                      fontWeight: 600,
                                      textTransform: "none",
                                      "&:hover": {
                                        background:
                                          "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                      },
                                    }}
                                  >
                                    Mint
                                  </Button>
                                </Tooltip>
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "rgba(255,255,255,0.5)" }}
                                >
                                  —
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            )}

            {/* Shop Analytics Tab (Super Agent only) */}
            {activeTab === "analytics" && isSuperAgent && (
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Shop Analytics
                </Typography>

                {isLoading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : shopAnalytics ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.7)"
                          >
                            Total Users
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {shopAnalytics.totalUsers || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.7)"
                          >
                            Total Agents
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {shopAnalytics.totalAgents || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.7)"
                          >
                            Active Users
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {shopAnalytics.activeUsers || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.7)"
                          >
                            Total Balance
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
 root                             {user?.currency} {Number(shopAnalytics.totalBalance || 0).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.7)"
                          >
                            Total Bets
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {shopAnalytics.totalBets || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            color="rgba(255,255,255,0.7)"
                          >
                            Total Stake
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {user?.currency} {Number(shopAnalytics.totalStake || 0).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <TrendingUpIcon
                      sx={{
                        fontSize: 80,
                        color: "rgba(255,255,255,0.3)",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" color="rgba(255,255,255,0.7)">
                      No analytics data available
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Betting Statistics
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 2,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="rgba(255,255,255,0.7)">
                          Total Bets Placed
                        </Typography>
                        <Typography fontWeight="bold">
                          {totalBetsPlaced}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 2,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="rgba(255,255,255,0.7)">
                          Total Stake
                        </Typography>
                        <Typography fontWeight="bold">
                          {user?.currency} {totalStake.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 2,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="rgba(255,255,255,0.7)">
                          Pending Bets
                        </Typography>
                        <Typography fontWeight="bold">
                          {
                            agentBets.filter((bet) => bet.status === "pending")
                              .length
                          }
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 2,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="rgba(255,255,255,0.7)">
                          Average Stake
                        </Typography>
                        <Typography fontWeight="bold">
                          {user?.currency}{" "}
                          {totalBetsPlaced > 0
                            ? (totalStake / totalBetsPlaced).toFixed(2)
                            : "0.00"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Account Information
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 2,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="rgba(255,255,255,0.7)">
                          Phone Number
                        </Typography>
                        <Typography fontWeight="bold">
                          {user?.phone_number}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 2,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="rgba(255,255,255,0.7)">
                          Role
                        </Typography>
                        <Chip label={user?.role} color="primary" size="small" />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 2,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="rgba(255,255,255,0.7)">
                          Shop
                        </Typography>
                        <Typography fontWeight="bold">
                          {user?.shop?.shop_name || "N/A"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 2,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="rgba(255,255,255,0.7)">
                          Currency
                        </Typography>
                        <Typography fontWeight="bold">
                          {user?.currency}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Container>

      {/* Send Money Modal */}
      <SendMoneyModal
        isOpen={showSendMoneyModal}
        onClose={() => setShowSendMoneyModal(false)}
        onSuccess={handleSendMoneySuccess}
      />

      {/* Mint Balance Modal */}
      <MintBalanceModal
        isOpen={showMintBalanceModal}
        onClose={() => {
          setShowMintBalanceModal(false);
          setSelectedAgent(null);
        }}
        onSuccess={handleMintBalanceSuccess}
        agent={selectedAgent}
      />

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={showCreateAgentModal}
        onClose={() => setShowCreateAgentModal(false)}
        onSuccess={handleCreateAgentSuccess}
      />
    </Box>
  );
};
