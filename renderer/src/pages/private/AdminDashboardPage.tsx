/**
 * Admin Dashboard Page - Complete Admin Panel
 * Integrates all 85+ admin endpoints from betzone-sports backend
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "../../store/hooks";
import { Header } from "../../components/Header";
import AdminService from "../../services/adminService";
import Grid from "@mui/material/GridLegacy";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Pagination,
  Switch,
  Stack,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
  People as UsersIcon,
  Store as ShopIcon,
  AccountBalanceWallet as WalletIcon,
  SportsEsports as BetIcon,
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  Assessment as ReportIcon,
  Notifications as NotificationIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  PersonAdd as PersonAddIcon,
  MonetizationOn as MoneyIcon,
} from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

interface AdminDashboardPageProps {
  onNavigate: (page: any) => void;
}

// Stat Card Component
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; loading?: boolean }> = ({
  title,
  value,
  icon,
  loading,
}) => (
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            {loading ? <CircularProgress size={20} /> : <Typography variant="h4">{value}</Typography>}
          </Box>
          <Box sx={{ p: 1, bgcolor: "action.hover", borderRadius: 2 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

// Main Component
export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isAdmin) loadDashboardStats();
  }, [isAdmin]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const stats = await AdminService.getDashboard();
      setDashboardStats(stats);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Access denied. Administrators only.</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => onNavigate("home")}>
          Go Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header onNavigate={onNavigate} currentPage="admin" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4" fontWeight="bold">Admin Dashboard</Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadDashboardStats} disabled={loading}>
            Refresh
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <StatCard
            title="Today's Revenue"
            value={`$${(dashboardStats?.today?.revenue || 0).toLocaleString()}`}
            icon={<TrendingIcon color="success" />}
            loading={loading}
          />
          <StatCard
            title="New Users"
            value={(dashboardStats?.today?.newUsers || 0).toString()}
            icon={<UsersIcon color="primary" />}
            loading={loading}
          />
          <StatCard
            title="Pending Deposits"
            value={(() => {
              const deposits = dashboardStats?.pending?.deposits;
              if (typeof deposits === 'number') return deposits.toString();
              if (typeof deposits === 'object' && deposits !== null) {
                // Backend might return { count: number, total: number }
                return (deposits.count || deposits.total || 0).toString();
              }
              return '0';
            })()}
            icon={<WalletIcon color="warning" />}
            loading={loading}
          />
          <StatCard
            title="Pending Withdrawals"
            value={(() => {
              const withdrawals = dashboardStats?.pending?.withdrawals;
              if (typeof withdrawals === 'number') return withdrawals.toString();
              if (typeof withdrawals === 'object' && withdrawals !== null) {
                return (withdrawals.count || withdrawals.total || 0).toString();
              }
              return '0';
            })()}
            icon={<MoneyIcon color="error" />}
            loading={loading}
          />
        </Grid>

        <Paper sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<UsersIcon />} label="Users" />
            <Tab icon={<ShopIcon />} label="Shops" />
            <Tab icon={<WalletIcon />} label="Transactions" />
            <Tab icon={<BetIcon />} label="Bets" />
            <Tab icon={<MoneyIcon />} label="Commissions" />
            <Tab icon={<TrendingIcon />} label="Analytics" />
            <Tab icon={<ScheduleIcon />} label="Settlements" />
            <Tab icon={<SecurityIcon />} label="RBAC" />
            <Tab icon={<HistoryIcon />} label="Audit" />
            <Tab icon={<NotificationIcon />} label="Notifications" />
            <Tab icon={<ReportIcon />} label="Reports" />
          </Tabs>
        </Paper>

        <Paper sx={{ p: 3, minHeight: 500 }}>
          {activeTab === 0 && <UsersTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 1 && <ShopsTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 2 && <TransactionsTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 3 && <BetsTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 4 && <CommissionsTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 5 && <AnalyticsTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 6 && <SettlementsTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 7 && <RBACTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 8 && <AuditTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 9 && <NotificationsTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
          {activeTab === 10 && <ReportsTab showSuccess={showSuccess} setError={setError} setLoading={setLoading} />}
        </Paper>
      </Container>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage(null)}>
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

// Users Tab
const UsersTab: React.FC<any> = ({ showSuccess, setError, setLoading }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ role: "", status: "", search: "" });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ phoneNumber: "", password: "", firstName: "", lastName: "", email: "", role: "user", shopId: "" });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 10, offset: (page - 1) * 10 };
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const result = await AdminService.listUsers(params);
      setUsers(result.users);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filters, page, setError, setLoading]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingUser) {
        const updateData: any = {};
        if (userForm.firstName) updateData.firstName = userForm.firstName;
        if (userForm.lastName) updateData.lastName = userForm.lastName;
        if (userForm.email) updateData.email = userForm.email;
        if (userForm.role) updateData.role = userForm.role;
        if (userForm.shopId) updateData.shopId = userForm.shopId;
        await AdminService.updateUser(editingUser.id, updateData);
        showSuccess("User updated");
      } else {
        await AdminService.createUser(userForm as any);
        showSuccess("User created");
      }
      setOpenDialog(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      setLoading(true);
      const isActive = user.isActive ?? user.is_active;
      if (isActive) await AdminService.deactivateUser(user.id);
      else await AdminService.activateUser(user.id);
      showSuccess(isActive ? "User deactivated" : "User activated");
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get user display name
  const getUserDisplayName = (user: any) => {
    const firstName = user.firstName || user.first_name || "";
    const lastName = user.lastName || user.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.phoneNumber || user.phone_number || "-";
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField label="Search" size="small" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} label="Role">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="agent">Agent</MenuItem>
            <MenuItem value="super_agent">Super Agent</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => { setEditingUser(null); setUserForm({ phoneNumber: "", password: "", firstName: "", lastName: "", email: "", role: "user", shopId: "" }); setOpenDialog(true); }}>
          Add User
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Phone</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(users || []).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.phoneNumber || user.phone_number}</TableCell>
                <TableCell>{getUserDisplayName(user)}</TableCell>
                <TableCell><Chip label={user.role} size="small" color={user.role === "admin" ? "error" : user.role === "super_agent" ? "warning" : user.role === "agent" ? "info" : "default"} /></TableCell>
                <TableCell>${(user.balance || 0).toLocaleString()}</TableCell>
                <TableCell><Switch checked={user.isActive ?? user.is_active} onChange={() => handleToggleStatus(user)} size="small" /></TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => { setEditingUser(user); setUserForm({ ...user, password: "" }); setOpenDialog(true); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, p) => setPage(p)} />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Phone Number" value={userForm.phoneNumber} onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })} disabled={!!editingUser} />
            {!editingUser && <TextField label="Password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />}
            <TextField label="First Name" value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} />
            <TextField label="Last Name" value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} />
            <TextField label="Email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
            <FormControl>
              <InputLabel>Role</InputLabel>
              <Select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} label="Role">
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="super_agent">Super Agent</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingUser ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Shops Tab
const ShopsTab: React.FC<any> = ({ showSuccess, setError, setLoading }) => {
  const [shops, setShops] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [shopForm, setShopForm] = useState({ name: "", location: "", address: "", phone: "", email: "", commissionRate: 5 });

  const loadShops = useCallback(async () => {
    try {
      setLoading(true);
      const result = await AdminService.listShops();
      setShops(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  useEffect(() => { loadShops(); }, [loadShops]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingShop) await AdminService.updateShop(editingShop.id, shopForm as any);
      else await AdminService.createShop(shopForm as any);
      showSuccess(editingShop ? "Shop updated" : "Shop created");
      setOpenDialog(false);
      loadShops();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get shop name - backend uses shop_name (snake_case)
  const getShopName = (shop: any) => shop.shop_name || shop.shopName || shop.name || "Unnamed Shop";
  const getCommissionRate = (shop: any) => shop.commission_rate || shop.commissionRate || 0;
  const getShopAddress = (shop: any) => shop.shop_address || shop.shopAddress || shop.location || shop.address || "No location";

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingShop(null); setShopForm({ name: "", location: "", address: "", phone: "", email: "", commissionRate: 5 }); setOpenDialog(true); }}>
          Add Shop
        </Button>
      </Box>
      <Grid container spacing={2}>
        {(shops || []).map((shop) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={shop.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="h6">{getShopName(shop)}</Typography>
                  <IconButton size="small" onClick={() => { setEditingShop(shop); setShopForm({ ...shop }); setOpenDialog(true); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography color="textSecondary" variant="body2">{getShopAddress(shop)}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label={`${getCommissionRate(shop)}% Commission`} size="small" color="primary" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingShop ? "Edit Shop" : "Create Shop"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={shopForm.name} onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })} />
            <TextField label="Location" value={shopForm.location} onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })} />
            <TextField label="Address" value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} />
            <TextField label="Phone" value={shopForm.phone} onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })} />
            <TextField label="Email" value={shopForm.email} onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })} />
            <TextField label="Commission Rate (%)" type="number" value={shopForm.commissionRate} onChange={(e) => setShopForm({ ...shopForm, commissionRate: Number(e.target.value) })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingShop ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Transactions Tab
const TransactionsTab: React.FC<any> = ({ showSuccess, setError, setLoading }) => {
  const [activeSubTab, setActiveSubTab] = useState<"deposits" | "withdrawals">("deposits");
  const [items, setItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      if (activeSubTab === "deposits") {
        const result = await AdminService.listDeposits(params);
        setItems(result.deposits);
      } else {
        const result = await AdminService.listWithdrawals(params);
        setItems(result.withdrawals);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeSubTab, statusFilter, setError, setLoading]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (id: string, action: "complete" | "cancel" | "flag") => {
    try {
      setLoading(true);
      if (activeSubTab === "deposits") {
        if (action === "complete") await AdminService.completeDeposit(id);
        else await AdminService.cancelDeposit(id);
      } else {
        if (action === "complete") await AdminService.completeWithdrawal(id);
        else if (action === "cancel") await AdminService.cancelWithdrawal(id);
        else await AdminService.flagWithdrawal(id, "Suspicious");
      }
      showSuccess(`${action}d successfully`);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get code
  const getCode = (item: any) => item.depositCode || item.withdrawalCode || item.code || "N/A";
  
  // Helper to get user display
  const getUserDisplay = (item: any) => {
    if (!item.user) return "-";
    const firstName = item.user.firstName || item.user.first_name || "";
    const lastName = item.user.lastName || item.user.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || item.user.phoneNumber || item.user.phone_number || "-";
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button variant={activeSubTab === "deposits" ? "contained" : "outlined"} onClick={() => setActiveSubTab("deposits")}>Deposits</Button>
        <Button variant={activeSubTab === "withdrawals" ? "contained" : "outlined"} onClick={() => setActiveSubTab("withdrawals")}>Withdrawals</Button>
        <FormControl size="small" sx={{ minWidth: 120, ml: "auto" }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            {activeSubTab === "withdrawals" && <MenuItem value="flagged">Flagged</MenuItem>}
          </Select>
        </FormControl>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(items || []).map((item) => (
              <TableRow key={item.id}>
                <TableCell><Typography fontFamily="monospace" fontWeight="bold">{getCode(item)}</Typography></TableCell>
                <TableCell>{getUserDisplay(item)}</TableCell>
                <TableCell>${(item.amount || 0).toLocaleString()}</TableCell>
                <TableCell><Chip label={item.status} size="small" color={item.status === "completed" ? "success" : item.status === "cancelled" ? "error" : item.status === "flagged" ? "warning" : "default"} /></TableCell>
                <TableCell>
                  {item.status === "pending" && (
                    <>
                      <Tooltip title="Complete"><IconButton size="small" color="success" onClick={() => handleAction(item.id, "complete")}><CheckIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Cancel"><IconButton size="small" color="error" onClick={() => handleAction(item.id, "cancel")}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                      {activeSubTab === "withdrawals" && (
                        <Tooltip title="Flag"><IconButton size="small" color="warning" onClick={() => handleAction(item.id, "flag")}><FlagIcon fontSize="small" /></IconButton></Tooltip>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Bets Tab
const BetsTab: React.FC<any> = ({ showSuccess, setError, setLoading }) => {
  const [bets, setBets] = useState<any[]>([]);
  const [filters, setFilters] = useState({ status: "" });

  const loadBets = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (filters.status) params.status = filters.status;
      const result = await AdminService.listBets(params);
      setBets(result.bets);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, setError, setLoading]);

  useEffect(() => { loadBets(); }, [loadBets]);

  // Helper to get user display
  const getUserDisplay = (bet: any) => {
    if (!bet.user) return "-";
    const firstName = bet.user.firstName || bet.user.first_name || "";
    const lastName = bet.user.lastName || bet.user.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || bet.user.phoneNumber || bet.user.phone_number || "-";
  };

  // Helper to get stake
  const getStake = (bet: any) => bet.stake || bet.totalStake || bet.total_stake || 0;
  
  // Helper to get odds
  const getOdds = (bet: any) => bet.combinedOdds || bet.combined_odds || bet.totalOdds || 1;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} label="Status">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="won">Won</MenuItem>
            <MenuItem value="lost">Lost</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Stake</TableCell>
              <TableCell>Odds</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(bets || []).map((bet) => (
              <TableRow key={bet.id}>
                <TableCell>{getUserDisplay(bet)}</TableCell>
                <TableCell>${getStake(bet).toLocaleString()}</TableCell>
                <TableCell>{getOdds(bet).toFixed(2)}</TableCell>
                <TableCell><Chip label={bet.status} size="small" color={bet.status === "won" ? "success" : bet.status === "lost" ? "error" : "default"} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Commissions Tab
const CommissionsTab: React.FC<any> = ({ setError, setLoading }) => {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const ov = await AdminService.getCommissionOverview();
        setOverview(ov);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setError, setLoading]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Unpaid</Typography>
            <Typography variant="h4" color="primary">${(overview?.totalUnpaid || 0).toLocaleString()}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Agents</Typography>
            <Typography variant="h4">{overview?.agentCount || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Analytics Tab
const AnalyticsTab: React.FC<any> = ({ setError, setLoading }) => {
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [analytics, setAnalytics] = useState<import("../../services/adminService").ShopAnalyticsData | null>(null);

  useEffect(() => {
    AdminService.listShops().then(setShops).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedShop) {
      setAnalytics(null);
      return;
    }
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getShopAnalytics(selectedShop);
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || "Failed to load shop analytics");
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [selectedShop, setError, setLoading]);

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Shop</InputLabel>
        <Select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)} label="Select Shop">
          {(shops || []).map((shop) => <MenuItem key={shop.id} value={shop.id}>{shop.shop_name || shop.shopName || shop.name || "Unnamed"}</MenuItem>)}
        </Select>
      </FormControl>
      
      {!selectedShop && (
        <Alert severity="info">Select a shop to view analytics</Alert>
      )}
      
      {selectedShop && analytics && (
        <Box>
          {/* Shop Info */}
          <Paper sx={{ p: 2.5, mb: 3, bgcolor: "rgba(33, 150, 243, 0.05)", border: "1px solid rgba(33, 150, 243, 0.15)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>{analytics.shop.name}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`Code: ${analytics.shop.code}`} size="small" variant="outlined" />
                  <Chip label={`${analytics.shop.commissionRate}% Commission`} size="small" color="primary" />
                  <Chip label={analytics.shop.isActive ? "● Active" : "● Inactive"} size="small" color={analytics.shop.isActive ? "success" : "error"} />
                </Stack>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" color="textSecondary" display="block">Max Bet Amount</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">SSP {analytics.shop.maxBetAmount.toLocaleString()}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Stats Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Staff */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: "rgba(33, 150, 243, 0.08)", border: "1px solid rgba(33, 150, 243, 0.2)" }}>
                <CardContent>
                  <Typography color="primary" variant="overline" fontWeight="bold">Staff</Typography>
                  <Typography variant="h3" fontWeight="bold">{analytics.staff.total}</Typography>
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    <Chip label={`${analytics.staff.superAgents} Super Agents`} size="small" color="primary" variant="outlined" />
                    <Chip label={`${analytics.staff.agents} Agents`} size="small" color="info" variant="outlined" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Customers */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: "rgba(156, 39, 176, 0.08)", border: "1px solid rgba(156, 39, 176, 0.2)" }}>
                <CardContent>
                  <Typography color="secondary" variant="overline" fontWeight="bold">Customers</Typography>
                  <Typography variant="h3" fontWeight="bold">{analytics.customers.total.toLocaleString()}</Typography>
                  <Typography variant="caption" color="textSecondary">Total registered users</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Total Bets */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: "rgba(255, 152, 0, 0.08)", border: "1px solid rgba(255, 152, 0, 0.2)" }}>
                <CardContent>
                  <Typography sx={{ color: "orange" }} variant="overline" fontWeight="bold">Total Bets</Typography>
                  <Typography variant="h3" fontWeight="bold">{analytics.betting.totalBets.toLocaleString()}</Typography>
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    <Chip label={`${analytics.betting.wonBets} Won`} size="small" color="success" variant="outlined" />
                    <Chip label={`${analytics.betting.lostBets} Lost`} size="small" color="error" variant="outlined" />
                    {analytics.betting.pendingBets > 0 && (
                      <Chip label={`${analytics.betting.pendingBets} Pending`} size="small" color="warning" variant="outlined" />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Revenue */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                bgcolor: analytics.betting.grossRevenue >= 0 ? "rgba(76, 175, 80, 0.08)" : "rgba(244, 67, 54, 0.08)", 
                border: analytics.betting.grossRevenue >= 0 ? "1px solid rgba(76, 175, 80, 0.3)" : "1px solid rgba(244, 67, 54, 0.3)" 
              }}>
                <CardContent>
                  <Typography color={analytics.betting.grossRevenue >= 0 ? "success" : "error"} variant="overline" fontWeight="bold">
                    Gross Revenue
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color={analytics.betting.grossRevenue >= 0 ? "success.main" : "error.main"}>
                    {analytics.betting.grossRevenue >= 0 ? "+" : "−"} SSP {Math.abs(analytics.betting.grossRevenue).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color={analytics.betting.grossRevenue >= 0 ? "success.main" : "error.main"}>
                    {analytics.betting.grossRevenue >= 0 ? "✓ Profit" : "⚠ Loss"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Betting & Financial Details */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2.5, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TrendingIcon fontSize="small" color="primary" /> Betting Summary
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ "& td": { py: 1.2 } }}>
                      <TableCell sx={{ color: "text.secondary" }}>Total Stake</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: "1rem" }}>
                        SSP {analytics.betting.totalStake.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ "& td": { py: 1.2 } }}>
                      <TableCell sx={{ color: "text.secondary" }}>Total Payouts</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: "1rem", color: "error.main" }}>
                        − SSP {analytics.betting.totalPayouts.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ "& td": { py: 1.2 } }}>
                      <TableCell sx={{ color: "text.secondary" }}>Total Tax Collected</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: "1rem", color: "info.main" }}>
                        SSP {analytics.betting.totalTax.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: "rgba(255,255,255,0.03)", "& td": { py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Gross Revenue</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", fontFamily: "monospace", fontSize: "1.1rem", color: analytics.betting.grossRevenue >= 0 ? "success.main" : "error.main" }}>
                        {analytics.betting.grossRevenue >= 0 ? "+" : "−"} SSP {Math.abs(analytics.betting.grossRevenue).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2.5, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WalletIcon fontSize="small" color="success" /> Transactions
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ "& td": { py: 1.2 } }}>
                      <TableCell sx={{ color: "text.secondary" }}>Total Deposits</TableCell>
                      <TableCell align="right">
                        <Chip label={analytics.deposits.total.toString()} size="small" color="success" sx={{ mr: 1 }} />
                        <Box component="span" sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: "1rem", color: "success.main" }}>
                          SSP {analytics.deposits.totalAmount.toLocaleString()}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {analytics.deposits.pending > 0 && (
                      <TableRow sx={{ "& td": { py: 1 } }}>
                        <TableCell sx={{ color: "warning.main", pl: 3 }}>↳ Pending Deposits</TableCell>
                        <TableCell align="right" sx={{ color: "warning.main", fontWeight: 500 }}>
                          {analytics.deposits.pending} pending
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ "& td": { py: 1.2 } }}>
                      <TableCell sx={{ color: "text.secondary" }}>Total Withdrawals</TableCell>
                      <TableCell align="right">
                        <Chip label={analytics.withdrawals.total.toString()} size="small" color="error" sx={{ mr: 1 }} />
                        <Box component="span" sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: "1rem", color: "error.main" }}>
                          SSP {analytics.withdrawals.totalAmount.toLocaleString()}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {analytics.withdrawals.pending > 0 && (
                      <TableRow sx={{ "& td": { py: 1 } }}>
                        <TableCell sx={{ color: "warning.main", pl: 3 }}>↳ Pending Withdrawals</TableCell>
                        <TableCell align="right" sx={{ color: "warning.main", fontWeight: 500 }}>
                          {analytics.withdrawals.pending} pending
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ bgcolor: "rgba(255,255,255,0.03)", "& td": { py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Net Cashflow</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", fontFamily: "monospace", fontSize: "1.1rem", color: (analytics.deposits.totalAmount - analytics.withdrawals.totalAmount) >= 0 ? "success.main" : "error.main" }}>
                        {(analytics.deposits.totalAmount - analytics.withdrawals.totalAmount) >= 0 ? "+" : "−"} SSP {Math.abs(analytics.deposits.totalAmount - analytics.withdrawals.totalAmount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Agents */}
          {analytics.topAgents.length > 0 && (
            <Paper sx={{ p: 2.5, mt: 3, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <UsersIcon fontSize="small" color="info" /> Top Performing Agents
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: "bold", color: "text.secondary" } }}>
                    <TableCell>Agent</TableCell>
                    <TableCell align="right">Bets Placed</TableCell>
                    <TableCell align="right">Total Stake</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.topAgents.map((agent, index) => (
                    <TableRow key={agent.id} sx={{ "& td": { py: 1.2 } }}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip label={`#${index + 1}`} size="small" color={index === 0 ? "warning" : index === 1 ? "info" : "default"} sx={{ minWidth: 40 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{agent.firstName} {agent.lastName}</Typography>
                            <Typography variant="caption" color="textSecondary">{agent.phoneNumber}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={agent.betsCount.toLocaleString()} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontFamily: "monospace", color: "success.main" }}>
                        SSP {agent.totalStake.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

// Settlements Tab
const SettlementsTab: React.FC<any> = ({ showSuccess, setError, setLoading }) => {
  const [pending, setPending] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [scores, setScores] = useState({ homeScore: 0, awayScore: 0 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminService.getPendingSettlements();
      setPending(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSettle = async () => {
    if (!selectedGame) return;
    try {
      setLoading(true);
      await AdminService.settleGame(selectedGame.id, scores);
      showSuccess("Game settled");
      setSelectedGame(null);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get team names
  const getHomeTeam = (game: any) => game.homeTeam || game.home_team || "Home";
  const getAwayTeam = (game: any) => game.awayTeam || game.away_team || "Away";
  const getPendingCount = (game: any) => game.pendingSelections || game.pending_selections || game.pendingBetsCount || 0;

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Game</TableCell>
              <TableCell>League</TableCell>
              <TableCell>Pending Selections</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(pending || []).map((game) => (
              <TableRow key={game.id}>
                <TableCell>{getHomeTeam(game)} vs {getAwayTeam(game)}</TableCell>
                <TableCell>{game.leagueKey || game.league_key || game.league || "-"}</TableCell>
                <TableCell>{getPendingCount(game)}</TableCell>
                <TableCell>
                  <Button size="small" variant="contained" onClick={() => { setSelectedGame(game); setScores({ homeScore: 0, awayScore: 0 }); }}>
                    Settle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selectedGame} onClose={() => setSelectedGame(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Settle: {selectedGame ? `${getHomeTeam(selectedGame)} vs ${getAwayTeam(selectedGame)}` : ""}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={`${selectedGame ? getHomeTeam(selectedGame) : "Home"} Score`} type="number" value={scores.homeScore} onChange={(e) => setScores({ ...scores, homeScore: Number(e.target.value) })} />
            <TextField label={`${selectedGame ? getAwayTeam(selectedGame) : "Away"} Score`} type="number" value={scores.awayScore} onChange={(e) => setScores({ ...scores, awayScore: Number(e.target.value) })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedGame(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSettle}>Settle</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// RBAC Tab
const RBACTab: React.FC<any> = ({ setError, setLoading }) => {
  const [roles, setRoles] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminService.listRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  useEffect(() => { loadData(); }, [loadData]);

  // Helper to get role display name
  const getRoleName = (role: any) => role.display_name || role.name || "Unnamed Role";
  
  // Helper to get permission count
  const getPermissionCount = (role: any) => {
    if (Array.isArray(role.permissions)) return role.permissions.length;
    if (typeof role.permissions === "object") return Object.keys(role.permissions).length;
    return 0;
  };

  return (
    <Box>
      <Typography variant="h6">Role Management</Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {(roles || []).map((role) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={role.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{getRoleName(role)}</Typography>
                <Typography color="textSecondary" variant="body2">{role.description || "No description"}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label={`${getPermissionCount(role)} permissions`} size="small" />
                  {role.isSystem || role.is_system ? <Chip label="System" size="small" color="primary" sx={{ ml: 1 }} /> : null}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Audit Tab
const AuditTab: React.FC<any> = ({ setError, setLoading }) => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getActivityLogs({});
        setLogs(data.logs);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setError, setLoading]);

  // Helper to get user name
  const getUserName = (log: any) => log.userName || log.user_role || "System";
  
  // Helper to get action type
  const getActionType = (log: any) => log.actionType || log.action_type || "-";

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(logs || []).map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.createdAt || log.created_at ? new Date(log.createdAt || log.created_at).toLocaleString() : "-"}</TableCell>
              <TableCell>{getUserName(log)}</TableCell>
              <TableCell><Chip label={getActionType(log)} size="small" /></TableCell>
              <TableCell>{log.description || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Notifications Tab
const NotificationsTab: React.FC<any> = ({ showSuccess, setError, setLoading }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", content: "", priority: "normal" });
  const [openDialog, setOpenDialog] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminService.listAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      await AdminService.createAnnouncement({ title: form.title, content: form.content, priority: form.priority as any });
      showSuccess("Announcement created");
      setOpenDialog(false);
      loadAnnouncements();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Announcements</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ title: "", content: "", priority: "normal" }); setOpenDialog(true); }}>Create</Button>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(announcements || []).map((ann) => (
              <TableRow key={ann.id}>
                <TableCell>{ann.title}</TableCell>
                <TableCell><Chip label={ann.priority} size="small" color={ann.priority === "high" ? "error" : "default"} /></TableCell>
                <TableCell><Chip label={ann.active ? "Active" : "Inactive"} size="small" color={ann.active ? "success" : "default"} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Content" multiline rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <FormControl>
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} label="Priority">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Reports Tab
const ReportsTab: React.FC<any> = ({ setError, setLoading }) => {
  const [trendsData, setTrendsData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getTrendsReport({});
        setTrendsData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setError, setLoading]);

  const chartData = trendsData?.trends ? {
    labels: trendsData.trends.map((t: any) => new Date(t.date).toLocaleDateString()),
    datasets: [{ label: "Bets", data: trendsData.trends.map((t: any) => t.bets), borderColor: "rgb(75, 192, 192)", backgroundColor: "rgba(75, 192, 192, 0.2)" }],
  } : null;

  return (
    <Box>
      <Typography variant="h6">Trends Report</Typography>
      {chartData && <Paper sx={{ p: 2, mt: 2 }}><Line data={chartData} /></Paper>}
      {!trendsData && <Alert severity="info" sx={{ mt: 2 }}>No trends data available</Alert>}
    </Box>
  );
};

export default AdminDashboardPage;
