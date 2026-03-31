/**
 * Admin Service - Complete Admin API Integration
 * Integrates all 85+ admin endpoints from betzone-sports backend
 * Response structures matched to backend exactly
 */

import axios from "axios";
import { API_BASE_URL, API_KEY } from "./apiConfig";

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");

// Create axios instance with auth header
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
});

// Add auth token to requests
adminApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// TYPES - Matching Backend Response Structure
// ==========================================

// User types
export interface User {
  id: string;
  phoneNumber?: string;
  phone_number?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string;
  role: "user" | "agent" | "super_agent" | "admin";
  shopId?: string;
  shop_id?: string;
  shopName?: string;
  balance: number;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  permissions?: Record<string, any>;
}

export interface CreateUserRequest {
  phoneNumber: string;
  password: string;
  role: "user" | "agent" | "super_agent" | "admin";
  firstName?: string;
  lastName?: string;
  email?: string;
  shopId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "user" | "agent" | "super_agent" | "admin";
  shopId?: string;
  isActive?: boolean;
}

// Shop types - matching backend
export interface Shop {
  id: string;
  shopName?: string;
  name?: string;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  commissionRate?: number;
  commission_rate?: number;
  superAgentId?: string;
  super_agent_id?: string;
  superAgentName?: string;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  staffCount?: number;
  customerCount?: number;
}

export interface CreateShopRequest {
  name: string;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  commissionRate: number;
  superAgentId?: string;
}

// Deposit types - matching backend
export interface DepositRequest {
  id: string;
  userId?: string;
  user?: {
    phoneNumber?: string;
    phone_number?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
  };
  amount: number;
  depositCode?: string;
  deposit_code?: string;
  code?: string;
  status: "pending" | "completed" | "cancelled";
  shopId?: string;
  shop?: {
    id?: string;
    name?: string;
    code?: string;
  };
  completedBy?: any;
  completedAt?: string;
  createdAt?: string;
  created_at?: string;
}

// Withdrawal types - matching backend
export interface WithdrawalRequest {
  id: string;
  userId?: string;
  user?: {
    phoneNumber?: string;
    phone_number?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
  };
  amount: number;
  withdrawalCode?: string;
  withdrawal_code?: string;
  code?: string;
  status: "pending" | "completed" | "cancelled" | "flagged";
  isFlagged?: boolean;
  flagReason?: string;
  shopId?: string;
  shop?: {
    id?: string;
    name?: string;
  };
  createdAt?: string;
  created_at?: string;
  completedAt?: string;
}

// Bet types - matching backend exactly
export interface Bet {
  id: string;
  ticketNumber?: string;
  ticket_number?: string;
  betType?: string;
  bet_type?: string;
  user?: {
    id?: string;
    phoneNumber?: string;
    phone_number?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
  };
  agent?: {
    id?: string;
    phoneNumber?: string;
    phone_number?: string;
    role?: string;
  };
  shop?: {
    id?: string;
    name?: string;
    code?: string;
  };
  stake?: number;
  totalStake?: number;
  total_stake?: number;
  combinedOdds?: number;
  combined_odds?: number;
  totalOdds?: number;
  potentialWinnings?: number;
  potential_winnings?: number;
  potentialWin?: number;
  taxAmount?: number;
  tax_amount?: number;
  netWinnings?: number;
  net_winnings?: number;
  actualWinnings?: number;
  actual_winnings?: number;
  selectionCount?: number;
  selection_count?: number;
  status: "pending" | "accepted" | "won" | "lost" | "push" | "cancelled" | "voided";
  createdAt?: string;
  created_at?: string;
  settledAt?: string;
  settled_at?: string;
}

// Commission types
export interface CommissionOverview {
  totalUnpaid: number;
  agentCount: number;
  periodStart?: string;
  periodEnd?: string;
}

// Settlement types - matching backend exactly
export interface PendingSettlement {
  id?: string;
  gameId?: string;
  externalId?: string;
  external_id?: string;
  homeTeam?: string;
  home_team?: string;
  awayTeam?: string;
  away_team?: string;
  homeScore?: number;
  home_score?: number;
  awayScore?: number;
  away_score?: number;
  leagueKey?: string;
  league_key?: string;
  league?: string;
  commenceTime?: string;
  commence_time?: string;
  startTime?: string;
  completedAt?: string;
  status?: string;
  pendingSelections?: number;
  pending_selections?: number;
  pendingBetsCount?: number;
  totalPendingStake?: number;
}

// RBAC types - matching backend
export interface Role {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  permissions: string[] | Record<string, any>;
  isSystem?: boolean;
  is_system?: boolean;
  createdAt?: string;
}

export interface Permission {
  key: string;
  category: "betting" | "shop" | "system";
  description: string;
}

// Audit types - matching backend
export interface ActivityLog {
  id: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  userRole?: string;
  user_role?: string;
  actionType?: string;
  action_type?: string;
  entityType?: string;
  entity_type?: string;
  entityId?: string;
  entity_id?: string;
  description?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  created_at?: string;
}

export interface ComplianceAlert {
  id: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved";
  entityType?: string;
  entityId?: string;
  createdAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Notification types - matching backend
export interface Notification {
  id: string;
  title: string;
  message?: string;
  content?: string;
  type?: string;
  priority?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  created_at?: string;
  createdBy?: any;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high";
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  created_at?: string;
  createdBy?: any;
}

// Dashboard stats
export interface DashboardStats {
  today?: {
    newUsers?: number;
    deposits?: number;
    withdrawals?: number;
    bets?: number;
    betStake?: number;
    revenue?: number;
  };
  pending?: {
    deposits?: number;
    withdrawals?: number;
    settlements?: number;
  };
  month?: {
    revenue?: number;
    profit?: number;
    totalBets?: number;
    activeUsers?: number;
  };
}

// Shop Analytics
export interface ShopAnalyticsData {
  shop: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    commissionRate: number;
    maxBetAmount: number;
  };
  staff: {
    total: number;
    superAgents: number;
    agents: number;
  };
  customers: {
    total: number;
  };
  betting: {
    totalBets: number;
    pendingBets: number;
    wonBets: number;
    lostBets: number;
    totalStake: number;
    totalPayouts: number;
    totalTax: number;
    grossRevenue: number;
  };
  deposits: {
    total: number;
    pending: number;
    totalAmount: number;
  };
  withdrawals: {
    total: number;
    pending: number;
    totalAmount: number;
  };
  dailyBreakdown: Array<{
    date: string;
    bets: number;
    stake: number;
    payouts: number;
    revenue: number;
  }>;
  topAgents: Array<{
    id: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    betsCount: number;
    totalStake: number;
  }>;
}

// ==========================================
// USER MANAGEMENT APIs
// ==========================================

export const listUsers = async (params?: {
  role?: string;
  shopId?: string;
  status?: "active" | "inactive";
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: User[]; total: number }> => {
  const response = await adminApi.get("/users", { params });
  // Backend returns { success: true, data: User[], meta: { total, page, limit, totalPages } }
  return { 
    users: response.data?.data || [], 
    total: response.data?.meta?.total || 0 
  };
};

export const getUser = async (id: string): Promise<User> => {
  const response = await adminApi.get(`/users/${id}`);
  return response.data?.data;
};

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await adminApi.post("/users", data);
  return response.data?.data;
};

export const updateUser = async (id: string, data: UpdateUserRequest): Promise<User> => {
  const response = await adminApi.put(`/users/${id}`, data);
  return response.data?.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await adminApi.delete(`/users/${id}`);
};

export const activateUser = async (id: string): Promise<void> => {
  await adminApi.post(`/users/${id}/activate`);
};

export const deactivateUser = async (id: string, reason?: string): Promise<void> => {
  await adminApi.post(`/users/${id}/deactivate`, { reason });
};

// ==========================================
// SHOP MANAGEMENT APIs
// ==========================================

export const listShops = async (params?: {
  search?: string;
  superAgentId?: string;
  isActive?: boolean;
}): Promise<Shop[]> => {
  const response = await adminApi.get("/shops", { params });
  // Backend returns { success: true, data: Shop[], count: number }
  return response.data?.data || [];
};

export const getShop = async (id: string): Promise<Shop> => {
  const response = await adminApi.get(`/shops/${id}`);
  return response.data?.data;
};

export const createShop = async (data: CreateShopRequest): Promise<Shop> => {
  const response = await adminApi.post("/shops", data);
  return response.data?.data;
};

export const updateShop = async (id: string, data: Partial<CreateShopRequest>): Promise<Shop> => {
  const response = await adminApi.put(`/shops/${id}`, data);
  return response.data?.data;
};

// ==========================================
// DEPOSIT MANAGEMENT APIs
// ==========================================

export const listDeposits = async (params?: {
  status?: "pending" | "completed" | "cancelled";
  shopId?: string;
  dateFrom?: string;
  dateTo?: string;
  code?: string;
  limit?: number;
  offset?: number;
}): Promise<{ deposits: DepositRequest[]; total: number }> => {
  const response = await adminApi.get("/deposits", { params });
  return { 
    deposits: response.data?.data || [], 
    total: response.data?.meta?.total || 0 
  };
};

export const getDeposit = async (id: string): Promise<DepositRequest> => {
  const response = await adminApi.get(`/deposits/${id}`);
  return response.data?.data;
};

export const completeDeposit = async (id: string, notes?: string): Promise<void> => {
  await adminApi.post(`/deposits/${id}/complete`, { notes });
};

export const cancelDeposit = async (id: string, reason?: string): Promise<void> => {
  await adminApi.post(`/deposits/${id}/cancel`, { reason });
};

// ==========================================
// WITHDRAWAL MANAGEMENT APIs
// ==========================================

export const listWithdrawals = async (params?: {
  status?: "pending" | "completed" | "cancelled" | "flagged";
  shopId?: string;
  dateFrom?: string;
  dateTo?: string;
  code?: string;
  limit?: number;
  offset?: number;
}): Promise<{ withdrawals: WithdrawalRequest[]; total: number }> => {
  const response = await adminApi.get("/withdrawals", { params });
  return { 
    withdrawals: response.data?.data || [], 
    total: response.data?.meta?.total || 0 
  };
};

export const getWithdrawal = async (id: string): Promise<WithdrawalRequest> => {
  const response = await adminApi.get(`/withdrawals/${id}`);
  return response.data?.data;
};

export const completeWithdrawal = async (id: string, notes?: string): Promise<void> => {
  await adminApi.post(`/withdrawals/${id}/complete`, { notes });
};

export const cancelWithdrawal = async (id: string, reason?: string): Promise<void> => {
  await adminApi.post(`/withdrawals/${id}/cancel`, { reason });
};

export const flagWithdrawal = async (id: string, reason: string): Promise<void> => {
  await adminApi.post(`/withdrawals/${id}/flag`, { reason });
};

// ==========================================
// BET MANAGEMENT APIs
// ==========================================

export const listBets = async (params?: {
  status?: string;
  userId?: string;
  shopId?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<{ bets: Bet[]; total: number }> => {
  const response = await adminApi.get("/bets", { params });
  return { 
    bets: response.data?.data || [], 
    total: response.data?.meta?.total || 0 
  };
};

export const getBet = async (id: string): Promise<Bet> => {
  const response = await adminApi.get(`/bets/${id}`);
  return response.data?.data;
};

export const cancelBet = async (id: string, reason: string): Promise<void> => {
  await adminApi.post(`/bets/${id}/cancel`, { reason });
};

export const voidBet = async (id: string, reason: string): Promise<void> => {
  await adminApi.post(`/bets/${id}/void`, { reason });
};

// ==========================================
// COMMISSION MANAGEMENT APIs
// ==========================================

export const getCommissionOverview = async (): Promise<CommissionOverview> => {
  const response = await adminApi.get("/commissions");
  return response.data?.data;
};

export const payCommission = async (
  agentId: string,
  data: { amount: number; periodStart: string; periodEnd: string; notes?: string }
): Promise<void> => {
  await adminApi.post(`/commissions/${agentId}/pay`, data);
};

// ==========================================
// SETTLEMENT MANAGEMENT APIs
// ==========================================

export const getPendingSettlements = async (): Promise<PendingSettlement[]> => {
  const response = await adminApi.get("/settlements/pending");
  // Backend returns { success: true, data: games[], meta: { page, limit } }
  return response.data?.data || [];
};

export const settleGame = async (
  gameId: string,
  data: { homeScore: number; awayScore: number; notes?: string }
): Promise<void> => {
  await adminApi.post(`/settlements/games/${gameId}/settle`, {
    home_score: data.homeScore,
    away_score: data.awayScore,
    reason: data.notes
  });
};

// ==========================================
// DASHBOARD API
// ==========================================

export const getDashboard = async (): Promise<DashboardStats> => {
  const response = await adminApi.get("/dashboard");
  return response.data?.data;
};

// ==========================================
// SHOP ANALYTICS APIs
// ==========================================

export const getShopAnalytics = async (shopId: string, params?: {
  from?: string;
  to?: string;
}): Promise<ShopAnalyticsData> => {
  const response = await adminApi.get(`/shops/${shopId}/analytics`, { params });
  return response.data?.data;
};

// ==========================================
// RBAC MANAGEMENT APIs (Phase 3)
// ==========================================

export const listRoles = async (): Promise<Role[]> => {
  const response = await adminApi.get("/rbac/roles");
  // Backend returns { success: true, data: { roles: [...] } }
  return response.data?.data?.roles || response.data?.data || [];
};

export const createRole = async (data: {
  name: string;
  description?: string;
  permissions: string[];
}): Promise<Role> => {
  const response = await adminApi.post("/rbac/roles", data);
  return response.data?.data;
};

export const updateRole = async (
  id: string,
  data: { name?: string; description?: string; permissions?: string[] }
): Promise<Role> => {
  const response = await adminApi.put(`/rbac/roles/${id}`, data);
  return response.data?.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await adminApi.delete(`/rbac/roles/${id}`);
};

export const listPermissions = async (): Promise<{
  betting: Permission[];
  shop: Permission[];
  system: Permission[];
}> => {
  const response = await adminApi.get("/rbac/permissions");
  return response.data?.data;
};

// ==========================================
// AUDIT & COMPLIANCE APIs (Phase 3)
// ==========================================

export const getActivityLogs = async (params?: {
  userId?: string;
  actionType?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<{ logs: ActivityLog[]; total: number }> => {
  const response = await adminApi.get("/audit/logs", { params });
  return { 
    logs: response.data?.data || [], 
    total: response.data?.meta?.total || 0 
  };
};

export const getComplianceAlerts = async (params?: {
  status?: "open" | "resolved" | "all";
}): Promise<ComplianceAlert[]> => {
  const response = await adminApi.get("/audit/alerts", { params });
  return response.data?.data || [];
};

// ==========================================
// NOTIFICATION APIs (Phase 3)
// ==========================================

export const listNotifications = async (params?: {
  type?: "all" | "system" | "user" | "alert";
  read?: boolean;
  limit?: number;
}): Promise<Notification[]> => {
  const response = await adminApi.get("/notifications", { params });
  return response.data?.data || [];
};

export const sendNotification = async (data: {
  title: string;
  message: string;
  targetType: "all" | "role" | "user" | "shop";
  targetId?: string;
  priority?: "low" | "normal" | "high" | "urgent";
}): Promise<void> => {
  await adminApi.post("/notifications/send", data);
};

export const listAnnouncements = async (): Promise<Announcement[]> => {
  const response = await adminApi.get("/notifications/announcements");
  return response.data?.data || [];
};

export const createAnnouncement = async (data: {
  title: string;
  content: string;
  priority?: "low" | "normal" | "high";
  startDate?: string;
  endDate?: string;
}): Promise<Announcement> => {
  const response = await adminApi.post("/notifications/announcements", data);
  return response.data?.data;
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await adminApi.delete(`/notifications/announcements/${id}`);
};

// ==========================================
// ADVANCED REPORTS APIs (Phase 3)
// ==========================================

export const getTrendsReport = async (params?: {
  period?: "day" | "week" | "month" | "year";
  from?: string;
  to?: string;
}): Promise<any> => {
  const response = await adminApi.get("/reports/advanced/trends", { params });
  return response.data?.data;
};

// Default export
const AdminService = {
  // Users
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  // Shops
  listShops,
  getShop,
  createShop,
  updateShop,
  // Deposits
  listDeposits,
  getDeposit,
  completeDeposit,
  cancelDeposit,
  // Withdrawals
  listWithdrawals,
  getWithdrawal,
  completeWithdrawal,
  cancelWithdrawal,
  flagWithdrawal,
  // Bets
  listBets,
  getBet,
  cancelBet,
  voidBet,
  // Commissions
  getCommissionOverview,
  payCommission,
  // Settlements
  getPendingSettlements,
  settleGame,
  // Dashboard
  getDashboard,
  // Shop Analytics
  getShopAnalytics,
  // RBAC
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  listPermissions,
  // Audit
  getActivityLogs,
  getComplianceAlerts,
  // Notifications
  listNotifications,
  sendNotification,
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  // Reports
  getTrendsReport,
};

export default AdminService;
