import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import GameManagementService from "../../services/gameManagementService";
import LeagueManagementService from "../../services/leagueManagementService";
import AgentService from "../../services/agentService";
import GamesService from "../../services/gamesService";
import ShopManagementService, { type ShopUser } from "../../services/shopManagementService";
import { Header } from "../../components/Header";
import { MintBalanceModal } from "../../components/MintBalanceModal";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  EventBusy as PostponedIcon,
  CalendarToday as CalendarIcon,
  Sports as SportsIcon,
  Build as ProcessIcon,
  Info as InfoIcon,
  Store as ShopIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  Money as MoneyIcon,
  RemoveCircleOutline as RemoveBalanceIcon,
  PersonSearch as PersonSearchIcon,
} from "@mui/icons-material";
import type { Shop } from "../../types/shops";
import type { ManagedAgent } from "../../store/agentSlice";

interface ManagementPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history" | "management"
  ) => void;
}

export const ManagementPage: React.FC<ManagementPageProps> = ({ onNavigate }) => {
  const { user } = useAppSelector((state) => state.auth);
  // Super agents default to postponed tab, admins default to leagues
  const defaultTab = user?.role === "super_agent" ? "postponed" : "leagues";
  const [activeTab, setActiveTab] = useState<"leagues" | "games" | "cron" | "postponed" | "shops" | "users">(defaultTab as any);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [leagueStats, setLeagueStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [cronStatus, setCronStatus] = useState<any>(null);
  const [cronStats, setCronStats] = useState<any>(null);
  const [postponedMatches, setPostponedMatches] = useState<any[]>([]);
  const [gamesSearch, setGamesSearch] = useState("");
  const [gamesStatus, setGamesStatus] = useState<"" | "scheduled" | "live" | "finished" | "cancelled" | "postponed">("");
  const [gamesLimit, setGamesLimit] = useState(50);
  const [gamesOffset, setGamesOffset] = useState(0);
  const [gamesCount, setGamesCount] = useState(0);
  const [gamesResults, setGamesResults] = useState<any[]>([]);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [featureTarget, setFeatureTarget] = useState<any | null>(null);
  const [featureRank, setFeatureRank] = useState<string>("");
  const [featureUntil, setFeatureUntil] = useState<string>(""); // datetime-local
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsQuery, setShopsQuery] = useState("");
  const [shopDialogOpen, setShopDialogOpen] = useState(false);
  const [shopDialogMode, setShopDialogMode] = useState<"create" | "edit">("create");
  const [shopEditing, setShopEditing] = useState<Shop | null>(null);
  const [shopStatsOpen, setShopStatsOpen] = useState(false);
  const [shopStats, setShopStats] = useState<any>(null);
  const [expandedShopId, setExpandedShopId] = useState<string | false>(false);
  const [shopUsersByShopId, setShopUsersByShopId] = useState<Record<string, ShopUser[]>>({});
  const [shopUsersLoadingByShopId, setShopUsersLoadingByShopId] = useState<Record<string, boolean>>({});
  const [showMintBalanceModal, setShowMintBalanceModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<ManagedAgent | null>(null);
  const [resetBalanceOpen, setResetBalanceOpen] = useState(false);
  const [resetBalanceTarget, setResetBalanceTarget] = useState<ShopUser | null>(null);
  const [resetBalanceShopId, setResetBalanceShopId] = useState<string | null>(null);
  const [resetBalanceLoading, setResetBalanceLoading] = useState(false);
  const [shopForm, setShopForm] = useState({
    shop_name: "",
    shop_code: "",
    shop_address: "",
    shop_phone: "",
    shop_email: "",
    contact_person: "",
    is_active: true,
    default_currency: "SSP",
    commission_rate: 5,
    max_daily_bets: 1000,
    max_bet_amount: 10000,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedPostponedGame, setSelectedPostponedGame] = useState<any>(null);
  const [showPostponedConfirmDialog, setShowPostponedConfirmDialog] = useState(false);
  const [postponedResult, setPostponedResult] = useState<any>(null);
  const [showPostponedResultDialog, setShowPostponedResultDialog] = useState(false);
  const [processingPostponed, setProcessingPostponed] = useState(false);

  // Admin: user search + actions
  const [usersPhoneQuery, setUsersPhoneQuery] = useState("");
  const [usersResults, setUsersResults] = useState<ShopUser[]>([]);
  const [usersSelectedShopByUserId, setUsersSelectedShopByUserId] = useState<Record<string, string>>({});
  const [adminMintOpen, setAdminMintOpen] = useState(false);
  const [adminMintTarget, setAdminMintTarget] = useState<ShopUser | null>(null);
  const [adminMintAmount, setAdminMintAmount] = useState<string>("");
  const [adminMintNotes, setAdminMintNotes] = useState<string>("");
  const [adminMintLoading, setAdminMintLoading] = useState(false);

  // Dialog states
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [leagueSettings, setLeagueSettings] = useState({
    isActive: false,
    autoUpdateResults: false,
    updateIntervalMinutes: 60,
  });

  const isAdmin = user?.role === "admin";
  const isSuperAgent = user?.role === "super_agent";
  const hasManagementAccess = isAdmin || isSuperAgent;

  useEffect(() => {
    // Super agents should default to postponed matches tab
    if (isSuperAgent && !isAdmin && activeTab === "leagues") {
      setActiveTab("postponed");
      return;
    }

    if (activeTab === "leagues" && isAdmin) {
      loadLeagues();
    } else if (activeTab === "cron" && isAdmin) {
      loadCronStatus();
    } else if (activeTab === "games" && isAdmin) {
      loadGames();
    } else if (activeTab === "shops" && isAdmin) {
      loadShops();
    } else if (activeTab === "users" && isAdmin) {
      // Users tab needs shops list for optional assignment when promoting to agent
      if (shops.length === 0) loadShops();
    } else if (activeTab === "postponed") {
      loadPostponedMatches();
    }
  }, [activeTab, isAdmin, isSuperAgent, gamesOffset, gamesLimit, gamesStatus]);

  const searchUsersByPhone = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const phone = usersPhoneQuery.trim();
      const res = await ShopManagementService.searchUsers(
        phone.length > 0 ? { phone, limit: 50, offset: 0 } : { limit: 50, offset: 0 }
      );
      setUsersResults(res);
      if (res.length === 0) setSuccess("No users found");
    } catch (err: any) {
      setError(err.message || "Failed to search users");
    } finally {
      setIsLoading(false);
    }
  };

  const promoteToAgent = async (u: ShopUser) => {
    setIsLoading(true);
    setError(null);
    try {
      const desiredShopId = u.shop_id || usersSelectedShopByUserId[u.id];
      if (!desiredShopId) {
        throw new Error("Select a shop for this user before promoting to agent");
      }
      const res = await ShopManagementService.updateUserRole({
        userId: u.id,
        role: "agent",
        shop_id: desiredShopId,
      });
      if (!res?.success) throw new Error(res?.error || "Failed to update role");
      setUsersResults((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: "agent", shop_id: desiredShopId } : x)));
      setSuccess("User promoted to agent");
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const promoteToSuperAgent = async (u: ShopUser) => {
    setIsLoading(true);
    setError(null);
    try {
      const desiredShopId = u.shop_id || usersSelectedShopByUserId[u.id];
      if (!desiredShopId) {
        throw new Error("Select a shop for this user before promoting to super agent");
      }
      const res = await ShopManagementService.updateUserRole({
        userId: u.id,
        role: "super_agent",
        shop_id: desiredShopId,
      });
      if (!res?.success) throw new Error(res?.error || "Failed to update role");
      setUsersResults((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: "super_agent", shop_id: desiredShopId } : x)));
      setSuccess("User promoted to super agent");
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const openAdminMint = (u: ShopUser) => {
    setAdminMintTarget(u);
    setAdminMintAmount("");
    setAdminMintNotes("");
    setAdminMintOpen(true);
  };

  const submitAdminMint = async () => {
    if (!adminMintTarget) return;
    const amountNum = Number(adminMintAmount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    setAdminMintLoading(true);
    setError(null);
    try {
      const res = await ShopManagementService.updateUserBalance({
        userId: adminMintTarget.id,
        action: "adjust",
        amount: amountNum,
        type: "mint",
        description: adminMintNotes || `Mint by admin (Management → Users)`,
      });
      if (!res?.success) throw new Error((res as any)?.error || "Failed to mint balance");
      const newBalance = Number(res?.data?.newBalance ?? 0);
      setUsersResults((prev) => prev.map((x) => (x.id === adminMintTarget.id ? { ...x, balance: newBalance } : x)));
      setSuccess("Balance minted");
      setAdminMintOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to mint balance");
    } finally {
      setAdminMintLoading(false);
    }
  };

  // Debounced search trigger for games
  useEffect(() => {
    if (!(activeTab === "games" && isAdmin)) return;
    const t = setTimeout(() => {
      setGamesOffset(0);
      loadGames();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesSearch]);

  const loadLeagues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await LeagueManagementService.getAllLeagues({ includeInactive: true });
      if (response.success && response.data) {
        setLeagues(response.data.leagues || []);
        setLeagueStats({
          total: response.data.total || 0,
          active: response.data.active || 0,
          inactive: response.data.inactive || 0,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCronStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statusData, statsData] = await Promise.all([
        GameManagementService.getCronStatus(),
        GameManagementService.getCronStatistics(),
      ]);
      setCronStatus(statusData.data || {});
      setCronStats(statsData.data || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateLeague = async (leagueKey: string) => {
    try {
      const response = await LeagueManagementService.activateLeague(leagueKey);
      setSuccess(response.message || "League activated successfully");
      loadLeagues();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeactivateLeague = async (leagueKey: string) => {
    try {
      const response = await LeagueManagementService.deactivateLeague(leagueKey);
      setSuccess(response.message || "League deactivated successfully");
      loadLeagues();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSyncLeagues = async () => {
    setIsLoading(true);
    try {
      const response = await LeagueManagementService.syncLeagues();
      setSuccess(response.message || "Leagues refreshed");
      await loadLeagues();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeLeagues = async () => {
    setIsLoading(true);
    try {
      const response = await LeagueManagementService.initializeLeagues();
      setSuccess(response.message || "Leagues refreshed");
      await loadLeagues();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateMultiple = async () => {
    if (selectedLeagues.length === 0) {
      setError("Please select leagues to activate");
      return;
    }
    try {
      const response = await LeagueManagementService.activateMultiple(selectedLeagues);
      setSuccess(`Activated ${response.data?.activated?.length || 0} leagues`);
      setSelectedLeagues([]);
      loadLeagues();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFetchLeagueGames = async (leagueKey: string) => {
    try {
      const response = await GameManagementService.fetchLeagueGames(leagueKey);
      setSuccess(response.message || "Games fetched successfully");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateLeagueResults = async (leagueKey: string) => {
    try {
      const response = await GameManagementService.updateLeagueResults(leagueKey);
      setSuccess(response.message || "Results updated successfully");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTriggerCronJob = async (jobId: string) => {
    try {
      const response = await GameManagementService.triggerCronJob(jobId);
      setSuccess(response.message || "Cron job triggered successfully");
      loadCronStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadPostponedMatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await GameManagementService.getPostponedMatches();
      setPostponedMatches(response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGames = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { games, count } = await GamesService.searchGamesWithMeta({
        search: gamesSearch.trim() || undefined,
        status: gamesStatus || undefined,
        limit: gamesLimit,
        offset: gamesOffset,
      } as any);
      setGamesResults(games);
      setGamesCount(count);
    } catch (err: any) {
      setError(err.message || "Failed to load games");
    } finally {
      setIsLoading(false);
    }
  };

  const loadShops = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ShopManagementService.listShops();
      setShops(data);
    } catch (err: any) {
      setError(err.message || "Failed to load shops");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateShop = () => {
    setShopDialogMode("create");
    setShopEditing(null);
    setShopForm({
      shop_name: "",
      shop_code: "",
      shop_address: "",
      shop_phone: "",
      shop_email: "",
      contact_person: "",
      is_active: true,
      default_currency: "SSP",
      commission_rate: 5,
      max_daily_bets: 1000,
      max_bet_amount: 10000,
    });
    setShopDialogOpen(true);
  };

  const openEditShop = (shop: Shop) => {
    setShopDialogMode("edit");
    setShopEditing(shop);
    setShopForm({
      shop_name: shop.shop_name || "",
      shop_code: shop.shop_code || "",
      shop_address: shop.shop_address || "",
      shop_phone: (shop.shop_phone || "") as any,
      shop_email: (shop.shop_email || "") as any,
      contact_person: (shop.contact_person || "") as any,
      is_active: Boolean(shop.is_active),
      default_currency: shop.default_currency || "SSP",
      commission_rate: Number(shop.commission_rate ?? 0),
      max_daily_bets: Number(shop.max_daily_bets ?? 0),
      max_bet_amount: Number(shop.max_bet_amount ?? 0),
    });
    setShopDialogOpen(true);
  };

  const closeShopDialog = () => {
    setShopDialogOpen(false);
    setShopEditing(null);
  };

  const submitShop = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!shopForm.shop_name.trim() || !shopForm.shop_code.trim() || !shopForm.shop_address.trim()) {
        throw new Error("Shop name, code, and address are required");
      }

      const payload: any = {
        shop_name: shopForm.shop_name.trim(),
        shop_code: shopForm.shop_code.trim(),
        shop_address: shopForm.shop_address.trim(),
        shop_phone: shopForm.shop_phone?.trim() || undefined,
        shop_email: shopForm.shop_email?.trim() || undefined,
        contact_person: shopForm.contact_person?.trim() || undefined,
        is_active: Boolean(shopForm.is_active),
        default_currency: shopForm.default_currency,
        commission_rate: Number(shopForm.commission_rate),
        max_daily_bets: Number(shopForm.max_daily_bets),
        max_bet_amount: Number(shopForm.max_bet_amount),
      };

      if (shopDialogMode === "create") {
        await ShopManagementService.createShop(payload);
        setSuccess("Shop created");
      } else if (shopDialogMode === "edit" && shopEditing) {
        await ShopManagementService.updateShop(shopEditing.id, payload);
        setSuccess("Shop updated");
      }

      closeShopDialog();
      await loadShops();
    } catch (err: any) {
      setError(err.message || "Failed to save shop");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShopActive = async (shop: Shop) => {
    setIsLoading(true);
    setError(null);
    try {
      await ShopManagementService.updateShop(shop.id, { is_active: !shop.is_active });
      setSuccess(`Shop ${!shop.is_active ? "activated" : "deactivated"}`);
      await loadShops();
    } catch (err: any) {
      setError(err.message || "Failed to update shop status");
    } finally {
      setIsLoading(false);
    }
  };

  const openShopStats = async (shop: Shop) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ShopManagementService.getShopStats(shop.id);
      setShopStats(res.data);
      setShopStatsOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to load shop stats");
    } finally {
      setIsLoading(false);
    }
  };

  const ensureShopUsersLoaded = async (shopId: string) => {
    if (shopUsersByShopId[shopId]) return;
    setShopUsersLoadingByShopId((p) => ({ ...p, [shopId]: true }));
    setError(null);
    try {
      const users = await ShopManagementService.listShopUsers(shopId);
      setShopUsersByShopId((p) => ({ ...p, [shopId]: users }));
    } catch (err: any) {
      setError(err.message || "Failed to load shop users");
      setShopUsersByShopId((p) => ({ ...p, [shopId]: [] }));
    } finally {
      setShopUsersLoadingByShopId((p) => ({ ...p, [shopId]: false }));
    }
  };

  const handleMintFromShop = (u: ShopUser) => {
    if (u.role !== "agent") return;
    const agent: ManagedAgent = {
      id: u.id,
      phone_number: u.phone_number,
      role: "agent",
      balance: Number(u.balance ?? 0),
      isActive: Boolean(u.is_active ?? true),
      createdAt: u.created_at || new Date().toISOString(),
    };
    setSelectedAgent(agent);
    setShowMintBalanceModal(true);
  };

  const handleMintSuccess = (agentId: string, newBalance: number) => {
    // Update cached user balances where present
    setShopUsersByShopId((prev) => {
      const next: Record<string, ShopUser[]> = { ...prev };
      for (const shopId of Object.keys(next)) {
        next[shopId] = (next[shopId] || []).map((u) =>
          u.id === agentId ? { ...u, balance: newBalance } : u
        );
      }
      return next;
    });
    setSuccess("Balance minted");
  };

  const openResetBalance = (shopId: string, u: ShopUser) => {
    setResetBalanceShopId(shopId);
    setResetBalanceTarget(u);
    setResetBalanceOpen(true);
  };

  const submitResetBalance = async () => {
    if (!resetBalanceTarget?.id) return;
    setResetBalanceLoading(true);
    setError(null);
    try {
      const res = await ShopManagementService.updateUserBalance({
        userId: resetBalanceTarget.id,
        action: "reset",
        type: "adjustment",
        description: "Balance reset by admin (Management → Shops)",
      });
      if (!res?.success) {
        throw new Error((res as any)?.error || "Failed to reset balance");
      }
      const newBalance = Number(res?.data?.newBalance ?? 0);
      setShopUsersByShopId((prev) => {
        if (!resetBalanceShopId) return prev;
        return {
          ...prev,
          [resetBalanceShopId]: (prev[resetBalanceShopId] || []).map((u) =>
            u.id === resetBalanceTarget.id ? { ...u, balance: newBalance } : u
          ),
        };
      });
      setSuccess("Balance reset");
      setResetBalanceOpen(false);
      setResetBalanceTarget(null);
      setResetBalanceShopId(null);
    } catch (err: any) {
      setError(err.message || "Failed to reset balance");
    } finally {
      setResetBalanceLoading(false);
    }
  };

  const openFeatureDialog = (game: any) => {
    setFeatureTarget(game);
    setFeatureRank("");
    setFeatureUntil("");
    setFeatureDialogOpen(true);
  };

  const closeFeatureDialog = () => {
    setFeatureDialogOpen(false);
    setFeatureTarget(null);
    setFeatureRank("");
    setFeatureUntil("");
  };

  const submitFeatureUpdate = async (isFeatured: boolean) => {
    if (!featureTarget?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const payload: any = {
        gameId: featureTarget.id,
        isFeatured,
      };
      if (isFeatured && featureRank.trim().length > 0) {
        const rankNum = Number(featureRank);
        if (!Number.isNaN(rankNum)) payload.featuredRank = rankNum;
      }
      if (isFeatured && featureUntil) {
        // Convert datetime-local to ISO
        payload.featuredUntil = new Date(featureUntil).toISOString();
      }
      const res = await GameManagementService.updateFeaturedGames([payload]);
      setSuccess(res.message || (isFeatured ? "Game featured successfully" : "Game unfeatured successfully"));
      closeFeatureDialog();
    } catch (err: any) {
      setError(err.message || "Failed to update featured games");
    } finally {
      setIsLoading(false);
    }
  };

  const quickUnfeature = async (game: any) => {
    if (!game?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await GameManagementService.updateFeaturedGames([{ gameId: game.id, isFeatured: false }]);
      setSuccess(res.message || "Game unfeatured successfully");
    } catch (err: any) {
      setError(err.message || "Failed to unfeature game");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPostponedGame = async (match: any) => {
    setSelectedPostponedGame(match);
    setShowPostponedConfirmDialog(true);
  };

  const confirmProcessPostponedGame = async () => {
    if (!selectedPostponedGame) return;

    setProcessingPostponed(true);
    setShowPostponedConfirmDialog(false);
    setError(null);

    try {
      const result = await AgentService.handlePostponedGame(selectedPostponedGame.external_id);
      setPostponedResult(result);
      setShowPostponedResultDialog(true);
      
      if (result.success) {
        setSuccess(`Successfully processed postponed game: ${result.message}`);
        // Reload the postponed matches list
        loadPostponedMatches();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process postponed game');
    } finally {
      setProcessingPostponed(false);
      setSelectedPostponedGame(null);
    }
  };

  const toggleLeagueSelection = (leagueKey: string) => {
    setSelectedLeagues((prev) =>
      prev.includes(leagueKey)
        ? prev.filter((k) => k !== leagueKey)
        : [...prev, leagueKey]
    );
  };

  if (!hasManagementAccess) {
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
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You need admin privileges to access this page.
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

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Header onNavigate={onNavigate} currentPage="management" />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {isAdmin ? "⚙️ Game & League Management" : "⚙️ Game Management"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isAdmin 
                  ? "Manage leagues, games, cron jobs, and postponed matches" 
                  : "Manage postponed matches and game-related operations"}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                if (activeTab === "leagues") loadLeagues();
                else if (activeTab === "cron") loadCronStatus();
              }}
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
          </Box>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            borderRadius: 2,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {isAdmin && <Tab icon={<PowerIcon />} label="Leagues" value="leagues" />}
            {isAdmin && <Tab icon={<SettingsIcon />} label="Games" value="games" />}
            {isAdmin && <Tab icon={<ShopIcon />} label="Shops" value="shops" />}
            {isAdmin && <Tab icon={<PersonSearchIcon />} label="Users" value="users" />}
            {isAdmin && <Tab icon={<SyncIcon />} label="Cron Jobs" value="cron" />}
            <Tab icon={<PostponedIcon />} label="Postponed Matches" value="postponed" />
          </Tabs>
        </Paper>

        {/* Leagues Tab */}
        {activeTab === "leagues" && (
          <Box>
            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Total Leagues
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {leagueStats.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Active Leagues
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {leagueStats.active}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Inactive Leagues
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {leagueStats.inactive}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Actions */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<SyncIcon />}
                  onClick={handleSyncLeagues}
                  disabled={isLoading}
                  color="primary"
                >
                  Sync Leagues
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleInitializeLeagues}
                  disabled={isLoading}
                  color="success"
                >
                  Initialize
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PowerIcon />}
                  onClick={handleActivateMultiple}
                  disabled={isLoading || selectedLeagues.length === 0}
                  color="warning"
                >
                  Activate Selected ({selectedLeagues.length})
                </Button>
              </Stack>
            </Paper>

            {/* Leagues Table */}
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
              }}
            >
              {isLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            sx={{ color: "text.secondary" }}
                            checked={selectedLeagues.length === leagues.length && leagues.length > 0}
                            onChange={() => {
                              if (selectedLeagues.length === leagues.length) {
                                setSelectedLeagues([]);
                              } else {
                                setSelectedLeagues(leagues.map((l) => l.key));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>League</TableCell>
                        <TableCell>Key</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Region</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leagues.map((league) => (
                        <TableRow key={league.key} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                              checked={selectedLeagues.includes(league.key)}
                              onChange={() => toggleLeagueSelection(league.key)}
                            />
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>{league.title}</TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            {league.key}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={league.isActive ? "Active" : "Inactive"}
                              color={league.isActive ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)" }}>
                            {league.region || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title={league.isActive ? "Deactivate" : "Activate"}>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    league.isActive
                                      ? handleDeactivateLeague(league.key)
                                      : handleActivateLeague(league.key)
                                  }
                                  sx={{ color: league.isActive ? "#f44336" : "#4caf50" }}
                                >
                                  {league.isActive ? <PowerOffIcon /> : <PowerIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Fetch Games">
                                <IconButton
                                  size="small"
                                  onClick={() => handleFetchLeagueGames(league.key)}
                                  sx={{ color: "#42a5f5" }}
                                >
                                  <RefreshIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Update Results">
                                <IconButton
                                  size="small"
                                  onClick={() => handleUpdateLeagueResults(league.key)}
                                  sx={{ color: "#ffa726" }}
                                >
                                  <SyncIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        )}

        {/* Games Tab */}
        {activeTab === "games" && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Featured Games Picker
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.6)">
                  {/* Uses <code>/api/games/search</code> to list games, then updates via <code>PUT /api/games/featured</code> (local repo) with a fallback for remote deployments. */}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadGames}
                disabled={isLoading}
                sx={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}
              >
                Refresh
              </Button>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
              <TextField
                label="Search"
                value={gamesSearch}
                onChange={(e) => setGamesSearch(e.target.value)}
                placeholder="e.g. manchester, arsenal, chelsea..."
                fullWidth
                InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                InputProps={{
                  sx: {
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
                  },
                }}
              />

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>Status</InputLabel>
                <Select
                  value={gamesStatus}
                  label="Status"
                  onChange={(e) => {
                    setGamesStatus(e.target.value as any);
                    setGamesOffset(0);
                  }}
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="live">Live</MenuItem>
                  <MenuItem value="finished">Finished</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="postponed">Postponed</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>Limit</InputLabel>
                <Select
                  value={gamesLimit}
                  label="Limit"
                  onChange={(e) => {
                    setGamesLimit(Number(e.target.value));
                    setGamesOffset(0);
                  }}
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
              <Typography variant="body2" color="rgba(255,255,255,0.6)">
                Showing {Math.min(gamesOffset + gamesResults.length, gamesCount)} of {gamesCount}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={isLoading || gamesOffset <= 0}
                  onClick={() => setGamesOffset((prev) => Math.max(0, prev - gamesLimit))}
                  sx={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  Prev
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={isLoading || gamesOffset + gamesLimit >= gamesCount}
                  onClick={() => setGamesOffset((prev) => prev + gamesLimit)}
                  sx={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  Next
                </Button>
              </Stack>
            </Box>

            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : gamesResults.length === 0 ? (
              <Box p={4}>
                <Typography color="rgba(255,255,255,0.6)">
                  No games found. Try a different search term.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>Match</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>League</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>Time</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gamesResults.map((g: any) => (
                      <TableRow
                        key={g.id}
                        sx={{
                          "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                        }}
                      >
                        <TableCell sx={{ color: "white" }}>
                          <Typography variant="body2" fontWeight="bold">
                            {g.homeTeam} vs {g.awayTeam}
                          </Typography>
                          <Typography variant="caption" color="rgba(255,255,255,0.5)">
                            {g.sportKey}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>{g.league}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                          {g.matchTime ? new Date(g.matchTime).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={String(g.status || "").toUpperCase() || "UNKNOWN"}
                            size="small"
                            color={
                              g.status === "live"
                                ? "warning"
                                : g.status === "finished"
                                ? "success"
                                : g.status === "cancelled" || g.status === "postponed"
                                ? "error"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.6)" }}>
                          <Typography variant="caption">{String(g.id).slice(0, 8)}…</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => openFeatureDialog(g)}
                              disabled={Boolean((g as any)?.isFeatured)}
                              sx={{
                                background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
                                textTransform: "none",
                              }}
                            >
                              Feature
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => quickUnfeature(g)}
                              disabled={!Boolean((g as any)?.isFeatured)}
                              sx={{
                                borderColor: "rgba(255,255,255,0.2)",
                                color: "white",
                                textTransform: "none",
                              }}
                            >
                              Unfeature
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}

        {/* Feature Dialog */}
        <Dialog open={featureDialogOpen} onClose={closeFeatureDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Feature Game</DialogTitle>
          <DialogContent>
            {featureTarget && (
              <Box mb={2}>
                <Typography variant="body2" fontWeight="bold">
                  {featureTarget.homeTeam} vs {featureTarget.awayTeam}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {featureTarget.id}
                </Typography>
              </Box>
            )}

            <Stack spacing={2}>
              <TextField
                label="Featured Rank (optional)"
                value={featureRank}
                onChange={(e) => setFeatureRank(e.target.value)}
                type="number"
                inputProps={{ min: 0, step: 1 }}
                fullWidth
              />
              <TextField
                label="Featured Until (optional)"
                value={featureUntil}
                onChange={(e) => setFeatureUntil(e.target.value)}
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeFeatureDialog} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => submitFeatureUpdate(true)}
              disabled={isLoading || !featureTarget}
            >
              Feature
            </Button>
          </DialogActions>
        </Dialog>

        {/* Shops Tab (Admin only) */}
        {activeTab === "shops" && isAdmin && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Shops
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.6)">
                  {/* Admin-only: create and update shops via <code>/api/shops</code>. */}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadShops}
                  disabled={isLoading}
                  sx={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ShopIcon />}
                  onClick={openCreateShop}
                  sx={{
                    background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
                    textTransform: "none",
                  }}
                >
                  New Shop
                </Button>
              </Stack>
            </Box>

            <TextField
              label="Search shops"
              value={shopsQuery}
              onChange={(e) => setShopsQuery(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
              InputProps={{
                sx: {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
                },
              }}
            />

            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={1}>
                {shops
                  .filter((s) => {
                    const q = shopsQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      s.shop_name.toLowerCase().includes(q) ||
                      s.shop_code.toLowerCase().includes(q) ||
                      (s.shop_address || "").toLowerCase().includes(q)
                    );
                  })
                  .map((shop) => {
                    const isExpanded = expandedShopId === shop.id;
                    const users = shopUsersByShopId[shop.id] || [];
                    const loadingUsers = Boolean(shopUsersLoadingByShopId[shop.id]);
                    const agentsCount = users.filter((u) => u.role === "agent").length;
                    const superAgentsCount = users.filter((u) => u.role === "super_agent").length;

                    return (
                      <Accordion
                        key={shop.id}
                        expanded={isExpanded}
                        onChange={async (_e, expanded) => {
                          setExpandedShopId(expanded ? shop.id : false);
                          if (expanded) await ensureShopUsersLoaded(shop.id);
                        }}
                        sx={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "rgba(255,255,255,0.7)" }} />}>
                          <Box sx={{ width: "100%" }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
                              <Box>
                                <Typography variant="body2" fontWeight="bold" color="white">
                                  {shop.shop_name}
                                </Typography>
                                <Typography variant="caption" color="rgba(255,255,255,0.6)">
                                  {shop.shop_code} • {shop.default_currency} • {shop.commission_rate}% • {shop.shop_address}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label={shop.is_active ? "ACTIVE" : "INACTIVE"}
                                  color={shop.is_active ? "success" : "default"}
                                  size="small"
                                />
                                <Tooltip title="Edit shop">
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditShop(shop); }} sx={{ color: "#42a5f5" }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Toggle active">
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleShopActive(shop); }} sx={{ color: "#ffa726" }}>
                                    {shop.is_active ? <PowerOffIcon fontSize="small" /> : <PowerIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Stats">
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); openShopStats(shop); }} sx={{ color: "#9ea5b2" }}>
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>

                            <Box mt={1} display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <Chip icon={<GroupIcon />} label={`Super Agents: ${superAgentsCount}`} size="small" />
                              <Chip icon={<GroupIcon />} label={`Agents: ${agentsCount}`} size="small" />
                            </Box>
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails>
                          {loadingUsers ? (
                            <Box display="flex" justifyContent="center" p={2}>
                              <CircularProgress size={22} />
                            </Box>
                          ) : (
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Balance</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {users
                                    .slice()
                                    .sort((a, b) => {
                                      const rank = (r: string) =>
                                        r === "super_agent" ? 0 : r === "agent" ? 1 : r === "user" ? 2 : 3;
                                      return rank(a.role) - rank(b.role);
                                    })
                                    .map((u) => {
                                      const bal = Number(u.balance ?? 0);
                                      const canMint = u.role === "agent";
                                      const canReset = u.role !== "admin";

                                      return (
                                        <TableRow key={u.id} hover>
                                          <TableCell sx={{ color: "white" }}>{u.phone_number}</TableCell>
                                          <TableCell>
                                            <Chip
                                              label={String(u.role).toUpperCase()}
                                              size="small"
                                              color={u.role === "super_agent" ? "success" : u.role === "agent" ? "info" : "default"}
                                            />
                                          </TableCell>
                                          <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>{bal.toFixed(2)}</TableCell>
                                          <TableCell>
                                            <Chip
                                              label={u.is_active === false ? "INACTIVE" : "ACTIVE"}
                                              size="small"
                                              color={u.is_active === false ? "default" : "success"}
                                            />
                                          </TableCell>
                                          <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                              <Tooltip title={canMint ? "Mint balance (agent only)" : "Mint is only for agents"}>
                                                <span>
                                                  <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<MoneyIcon />}
                                                    disabled={!canMint}
                                                    onClick={() => handleMintFromShop(u)}
                                                    sx={{ textTransform: "none" }}
                                                  >
                                                    Mint
                                                  </Button>
                                                </span>
                                              </Tooltip>

                                              <Tooltip title="Reset balance to 0">
                                                <span>
                                                  <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<RemoveBalanceIcon />}
                                                    disabled={!canReset || resetBalanceLoading}
                                                    onClick={() => openResetBalance(shop.id, u)}
                                                    sx={{ textTransform: "none", borderColor: "rgba(255,255,255,0.2)", color: "white" }}
                                                  >
                                                    Reset
                                                  </Button>
                                                </span>
                                              </Tooltip>
                                            </Stack>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
              </Stack>
            )}
          </Paper>
        )}

        {/* Users Tab (Admin only) */}
        {activeTab === "users" && isAdmin && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Users
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.6)">
                  Admin-only: search users by phone, promote to agent, and mint balance.
                </Typography>
              </Box>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
              <TextField
                label="Search by phone"
                value={usersPhoneQuery}
                onChange={(e) => setUsersPhoneQuery(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                startIcon={<PersonSearchIcon />}
                onClick={searchUsersByPhone}
                disabled={isLoading}
                sx={{ textTransform: "none", minWidth: 160 }}
              >
                Search
              </Button>
            </Stack>

            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Phone</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Shop</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usersResults.map((u) => {
                      const bal = Number(u.balance ?? 0);
                      const shopId = (u.shop_id || usersSelectedShopByUserId[u.id] || "") as string;
                      const isAlreadyPrivileged = u.role === "admin" || u.role === "super_agent";
                      return (
                        <TableRow key={u.id} hover>
                          <TableCell sx={{ color: "white" }}>{u.phone_number}</TableCell>
                          <TableCell>
                            <Chip label={String(u.role).toUpperCase()} size="small" />
                          </TableCell>
                          <TableCell sx={{ minWidth: 220 }}>
                            <FormControl size="small" fullWidth>
                              <InputLabel>Shop</InputLabel>
                              <Select
                                label="Shop"
                                value={shopId}
                                onChange={(e) =>
                                  setUsersSelectedShopByUserId((p) => ({ ...p, [u.id]: String(e.target.value) }))
                                }
                                disabled={Boolean(u.shop_id)}
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                {shops.map((s) => (
                                  <MenuItem key={s.id} value={s.id}>
                                    {s.shop_name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>{bal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={u.is_active === false ? "INACTIVE" : "ACTIVE"}
                              size="small"
                              color={u.is_active === false ? "default" : "success"}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<MoneyIcon />}
                                onClick={() => openAdminMint(u)}
                                sx={{ textTransform: "none", borderColor: "rgba(255,255,255,0.2)", color: "white" }}
                              >
                                Mint
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => promoteToAgent(u)}
                                disabled={u.role === "agent" || isAlreadyPrivileged}
                                sx={{ textTransform: "none" }}
                              >
                                Make Agent
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => promoteToSuperAgent(u)}
                                disabled={isAlreadyPrivileged}
                                sx={{ textTransform: "none" }}
                              >
                                Make Super Agent
                              </Button>
                            </Stack>
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

        {/* Create/Edit Shop Dialog */}
        <Dialog open={shopDialogOpen} onClose={closeShopDialog} maxWidth="md" fullWidth>
          <DialogTitle>{shopDialogMode === "create" ? "Create Shop" : "Edit Shop"}</DialogTitle>
          <DialogContent sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Shop Name"
                  value={shopForm.shop_name}
                  onChange={(e) => setShopForm((p) => ({ ...p, shop_name: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Shop Code"
                  value={shopForm.shop_code}
                  onChange={(e) => setShopForm((p) => ({ ...p, shop_code: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Shop Address"
                  value={shopForm.shop_address}
                  onChange={(e) => setShopForm((p) => ({ ...p, shop_address: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone (optional)"
                  value={shopForm.shop_phone}
                  onChange={(e) => setShopForm((p) => ({ ...p, shop_phone: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email (optional)"
                  value={shopForm.shop_email}
                  onChange={(e) => setShopForm((p) => ({ ...p, shop_email: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Contact Person (optional)"
                  value={shopForm.contact_person}
                  onChange={(e) => setShopForm((p) => ({ ...p, contact_person: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shopForm.is_active}
                      onChange={(e) => setShopForm((p) => ({ ...p, is_active: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Default Currency"
                  value={shopForm.default_currency}
                  onChange={(e) => setShopForm((p) => ({ ...p, default_currency: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Commission Rate (%)"
                  type="number"
                  value={shopForm.commission_rate}
                  onChange={(e) => setShopForm((p) => ({ ...p, commission_rate: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Max Daily Bets"
                  type="number"
                  value={shopForm.max_daily_bets}
                  onChange={(e) => setShopForm((p) => ({ ...p, max_daily_bets: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Max Bet Amount"
                  type="number"
                  value={shopForm.max_bet_amount}
                  onChange={(e) => setShopForm((p) => ({ ...p, max_bet_amount: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeShopDialog} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="contained" onClick={submitShop} disabled={isLoading}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Shop Stats Dialog */}
        <Dialog open={shopStatsOpen} onClose={() => setShopStatsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Shop Stats</DialogTitle>
          <DialogContent>
            {shopStats ? (
              <Stack spacing={1}>
                <Typography>Total shops: {shopStats.totalShops}</Typography>
                <Typography>Active: {shopStats.activeShops}</Typography>
                <Typography>Inactive: {shopStats.inactiveShops}</Typography>
                <Typography>Total max bet amount: {shopStats.totalMaxBetAmount}</Typography>
                <Typography>Average max bet amount: {shopStats.averageMaxBetAmount}</Typography>
              </Stack>
            ) : (
              <Typography color="text.secondary">No stats loaded</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShopStatsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Mint Balance Modal (re-used) */}
        <MintBalanceModal
          isOpen={showMintBalanceModal}
          onClose={() => {
            setShowMintBalanceModal(false);
            setSelectedAgent(null);
          }}
          onSuccess={handleMintSuccess}
          agent={selectedAgent}
        />

        {/* Reset Balance Confirm */}
        <Dialog open={resetBalanceOpen} onClose={() => setResetBalanceOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Reset Balance</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              This will set the user’s balance to <b>0</b> by posting an admin balance reset transaction.
            </Typography>
            <Box mt={2}>
              <Typography variant="body2">
                User: <b>{resetBalanceTarget?.phone_number}</b>
              </Typography>
              <Typography variant="body2">
                Role: <b>{resetBalanceTarget?.role}</b>
              </Typography>
              <Typography variant="body2">
                Current balance: <b>{Number(resetBalanceTarget?.balance ?? 0).toFixed(2)}</b>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetBalanceOpen(false)} disabled={resetBalanceLoading}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={submitResetBalance} disabled={resetBalanceLoading || !resetBalanceTarget}>
              {resetBalanceLoading ? "Resetting..." : "Reset"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Admin Mint (any user) */}
        <Dialog open={adminMintOpen} onClose={() => setAdminMintOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Mint Balance</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Mint balance to: <b>{adminMintTarget?.phone_number}</b>
            </Typography>
            <Box mt={2}>
              <TextField
                label="Amount"
                type="number"
                value={adminMintAmount}
                onChange={(e) => setAdminMintAmount(e.target.value)}
                fullWidth
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box mt={2}>
              <TextField
                label="Notes (optional)"
                value={adminMintNotes}
                onChange={(e) => setAdminMintNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdminMintOpen(false)} disabled={adminMintLoading}>
              Cancel
            </Button>
            <Button variant="contained" onClick={submitAdminMint} disabled={adminMintLoading || !adminMintTarget}>
              {adminMintLoading ? "Minting..." : "Mint"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cron Tab */}
        {activeTab === "cron" && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Cron Job Status
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.6)" sx={{ mb: 3 }}>
                  Monitor and manage automated tasks
                </Typography>
                {cronStatus && Object.keys(cronStatus).length > 0 ? (
                  <Grid container spacing={2}>
                    {Object.entries(cronStatus).map(([jobId, status]: [string, any]) => (
                      <Grid item xs={12} md={6} key={jobId}>
                        <Card
                          sx={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="h6" gutterBottom>
                                  {jobId}
                                </Typography>
                                <Typography variant="caption" color="rgba(255,255,255,0.6)">
                                  Status: {status.status || "Unknown"}
                                </Typography>
                              </Box>
                              <Tooltip title="Trigger Job">
                                <IconButton
                                  onClick={() => handleTriggerCronJob(jobId)}
                                  sx={{ color: "#42a5f5" }}
                                >
                                  <PlayIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="rgba(255,255,255,0.5)">
                    No cron job data available
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        )}

        {/* Postponed Matches Tab */}
        {activeTab === "postponed" && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      🚨 Postponed Matches
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.6)">
                      Matches that have been detected as postponed or cancelled
                    </Typography>
                  </Box>
                  <Chip
                    label={`${postponedMatches.length} Postponed`}
                    color="warning"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>

                {postponedMatches.length === 0 ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={6}
                  >
                    <CheckIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
                    <Typography variant="h6" color="rgba(255,255,255,0.8)" gutterBottom>
                      No Postponed Matches
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.5)">
                      All matches are on schedule!
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>
                            Match
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>
                            Sport
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>
                            League
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>
                            Original Time
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>
                            Updated
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }} align="center">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {postponedMatches.map((match) => (
                          <TableRow
                            key={match.id}
                            sx={{
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.05)",
                              },
                            }}
                          >
                            <TableCell sx={{ color: "white" }}>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {match.home_team_name} vs {match.away_team_name}
                                </Typography>
                                <Typography variant="caption" color="rgba(255,255,255,0.5)">
                                  ID: {match.external_id}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <SportsIcon fontSize="small" />
                                <Box>
                                  <Typography variant="body2">
                                    {match.sport_title || match.sport_key}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                              {match.league_title || match.league_key || "N/A"}
                            </TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.8)" }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CalendarIcon fontSize="small" />
                                <Typography variant="body2">
                                  {new Date(match.commence_time).toLocaleString()}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={match.status.toUpperCase()}
                                color="warning"
                                size="small"
                                icon={<PostponedIcon />}
                              />
                            </TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.6)" }}>
                              <Typography variant="caption">
                                {new Date(match.updated_at).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Process postponed game - Remove from active bets">
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<ProcessIcon />}
                                  onClick={() => handleProcessPostponedGame(match)}
                                  disabled={processingPostponed}
                                  sx={{
                                    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                                    "&:hover": {
                                      background: "linear-gradient(135deg, #ee5a6f 0%, #c92a2a 100%)",
                                    },
                                    "&:disabled": {
                                      background: "rgba(255,255,255,0.1)",
                                    },
                                  }}
                                >
                                  Process
                                </Button>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Paper>
        )}

        {/* Postponed Game Confirmation Dialog */}
        <Dialog
          open={showPostponedConfirmDialog}
          onClose={() => setShowPostponedConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%)",
              border: "1px solid rgba(255, 165, 0, 0.3)",
            },
          }}
        >
          <DialogTitle sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Box display="flex" alignItems="center" gap={1}>
              <PostponedIcon color="warning" />
              <Typography variant="h6">Process Postponed Game</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {selectedPostponedGame && (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    This action will:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Remove this game from all active bets</li>
                    <li>Recalculate odds and potential winnings</li>
                    <li>Update affected betslips</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </Alert>
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Typography variant="subtitle2" color="rgba(255,255,255,0.7)" gutterBottom>
                    Game Details:
                  </Typography>
                  <Typography variant="body1" color="white" fontWeight="bold" gutterBottom>
                    {selectedPostponedGame.home_team_name} vs {selectedPostponedGame.away_team_name}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    ID: {selectedPostponedGame.external_id}
                  </Typography>
                  <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    Sport: {selectedPostponedGame.sport_title} | League: {selectedPostponedGame.league_title}
                  </Typography>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", p: 2 }}>
            <Button
              onClick={() => setShowPostponedConfirmDialog(false)}
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmProcessPostponedGame}
              variant="contained"
              color="warning"
              startIcon={<ProcessIcon />}
            >
              Process Game
            </Button>
          </DialogActions>
        </Dialog>

        {/* Postponed Game Result Dialog */}
        <Dialog
          open={showPostponedResultDialog}
          onClose={() => setShowPostponedResultDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
            },
          }}
        >
          <DialogTitle sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Box display="flex" alignItems="center" gap={1}>
              {postponedResult?.success ? (
                <CheckIcon color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
              <Typography variant="h6">Processing Result</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {postponedResult && (
              <Box>
                <Alert severity={postponedResult.success ? "success" : "error"} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {postponedResult.message}
                  </Typography>
                </Alert>

                {postponedResult.success && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card
                        sx={{
                          background: "rgba(76, 175, 80, 0.1)",
                          border: "1px solid rgba(76, 175, 80, 0.3)",
                        }}
                      >
                        <CardContent>
                          <Typography variant="caption" color="rgba(255,255,255,0.7)">
                            Affected Bets
                          </Typography>
                          <Typography variant="h4" color="#4caf50" fontWeight="bold">
                            {postponedResult.affectedBets}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card
                        sx={{
                          background: "rgba(33, 150, 243, 0.1)",
                          border: "1px solid rgba(33, 150, 243, 0.3)",
                        }}
                      >
                        <CardContent>
                          <Typography variant="caption" color="rgba(255,255,255,0.7)">
                            Affected Betslips
                          </Typography>
                          <Typography variant="h4" color="#2196f3" fontWeight="bold">
                            {postponedResult.affectedBetslips}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {postponedResult.errors && postponedResult.errors.length > 0 && (
                  <Box mt={2}>
                    <Alert severity="warning">
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Warnings:
                      </Typography>
                      {postponedResult.errors.map((error: string, index: number) => (
                        <Typography key={index} variant="caption" display="block">
                          • {error}
                        </Typography>
                      ))}
                    </Alert>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", p: 2 }}>
            <Button
              onClick={() => setShowPostponedResultDialog(false)}
              variant="contained"
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};


