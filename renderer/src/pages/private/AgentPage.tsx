import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  setLoading,
  setError,
  setManagedUsers,
  addManagedUser,
  updateManagedUser,
  removeManagedUser,
  setSelectedUser,
  setAgentBets,
  addAgentBet,
  updateAgentBet,
  addCommissionTransaction,
  setAgentStats,
  ManagedUser,
  AgentBet,
  CommissionTransaction,
} from "../../store/agentSlice";
import AgentService from "../../services/agentService";
import { Header } from "../../components/Header";
import { printThermalTicket as printTicket } from "../../services/printService";

interface AgentPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

export const AgentPage: React.FC<AgentPageProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    managedUsers,
    agentBets,
    commissionTransactions,
    selectedUser,
    isLoading,
    error,
    totalCommission,
    totalBetsPlaced,
    totalStake,
  } = useAppSelector((state) => state.agent);

  // Debug logging
  console.log("Current managedUsers state:", managedUsers);
  console.log("managedUsers.length:", managedUsers.length);
  console.log("Current agentBets state:", agentBets);
  console.log("agentBets.length:", agentBets.length);
  console.log("isLoading:", isLoading);
  console.log("error:", error);

  const [activeTab, setActiveTab] = useState<
    "users" | "bets" | "commissions" | "stats"
  >("users");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [betStatusFilter, setBetStatusFilter] = useState<
    "all" | "pending" | "accepted" | "rejected" | "settled"
  >("all");
  const [showBetTicket, setShowBetTicket] = useState(false);
  const [selectedBetTicket, setSelectedBetTicket] = useState<AgentBet | null>(
    null
  );
  const [showBalanceUpdate, setShowBalanceUpdate] = useState(false);
  const [selectedUserForBalance, setSelectedUserForBalance] =
    useState<ManagedUser | null>(null);
  const [balanceUpdateData, setBalanceUpdateData] = useState({
    amount: 0,
    type: "deposit" as "deposit" | "withdrawal",
    description: "",
  });
  const [expandedBets, setExpandedBets] = useState<Set<string>>(new Set());

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

  const printThermalTicket = (bet: AgentBet, combinedOdds?: number) => {
    // Calculate combined odds from selections if not available
    const calculatedOdds =
      combinedOdds ||
      (bet as any).combinedOdds ||
      (bet.selections?.length > 0
        ? bet.selections.reduce((total, selection) => total * selection.odds, 1)
        : undefined);
    console.log("👨‍💼 AgentPage calling printTicket with:", {
      bet,
      combinedOdds: calculatedOdds,
      selections: bet.selections,
      betKeys: Object.keys(bet),
      allOddsFields: {
        combinedOdds: (bet as any).combinedOdds,
        totalOdds: (bet as any).totalOdds,
        odds: (bet as any).odds,
        selections: bet.selections,
      },
    });
    printTicket(bet, calculatedOdds);
  };
  const [newUser, setNewUser] = useState({
    phone_number: "",
    country_code: "KE",
    password: "",
    commission_rate: 0.08, // 8% default commission
  });

  // Check if user is an agent
  if (!user || user.role !== "agent") {
    return (
      <div className="agent-page">
        <div className="access-denied">
          <div className="access-denied-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>You need agent privileges to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      dispatch(setLoading(true));
      console.log("Loading agent data...");

      // Load users first (this is the most important)
      let users: ManagedUser[] = [];
      let bets: AgentBet[] = [];
      let commissions: CommissionTransaction[] = [];

      try {
        users = await AgentService.getManagedUsers();
        console.log("Received users from API:", users);
        console.log("Users length:", users.length);
        console.log("Dispatching setManagedUsers with:", users);
        dispatch(setManagedUsers(users));
      } catch (error: any) {
        console.error("Failed to load managed users:", error);
        dispatch(setError(`Failed to load managed users: ${error.message}`));
      }

      // Load bets (non-critical)
      try {
        const statusParam =
          betStatusFilter === "all" ? undefined : betStatusFilter;
        bets = await AgentService.getAgentBets(statusParam);
        console.log("Received bets from API:", bets);
        console.log("Dispatching bets to Redux store:", bets.length, "bets");
        dispatch(setAgentBets(bets));
      } catch (error: any) {
        console.error("Failed to load agent bets (non-critical):", error);
      }

      // Load commissions (non-critical) - COMMENTED OUT
      // try {
      //   commissions = await AgentService.getCommissionTransactions();
      //   console.log("Received commissions from API:", commissions);
      // } catch (error: any) {
      //   console.error(
      //     "Failed to load commission transactions (non-critical):",
      //     error
      //   );
      // }

      // Calculate stats from the data
      const stats = {
        totalCommission: 0, // commissions.reduce((sum, t) => sum + t.amount, 0), // Commented out
        totalBetsPlaced: bets.length,
        totalStake: bets.reduce((sum, bet) => sum + bet.totalStake, 0),
      };
      dispatch(setAgentStats(stats));

      console.log("Agent data loading completed");
    } catch (error: any) {
      console.error("Error in loadAgentData:", error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.phone_number || !newUser.password) {
      dispatch(setError("Phone number and password are required"));
      return;
    }

    try {
      dispatch(setLoading(true));
      const createdUser = await AgentService.createUser(newUser);
      dispatch(addManagedUser(createdUser));
      setShowCreateUser(false);
      setNewUser({
        phone_number: "",
        country_code: "KE",
        password: "",
        commission_rate: 0.08,
      });
      console.log("User created successfully:", createdUser);
    } catch (error: any) {
      console.error("Failed to create user:", error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUserForBalance) return;

    try {
      dispatch(setLoading(true));
      const updatedUser = await AgentService.updateUserBalance(
        selectedUserForBalance.id,
        {
          amount: balanceUpdateData.amount,
          type: balanceUpdateData.type,
          description: balanceUpdateData.description,
        }
      );

      // Update the user in the Redux store
      dispatch(updateManagedUser(updatedUser));

      // Close modal and reset form
      setShowBalanceUpdate(false);
      setSelectedUserForBalance(null);
      setBalanceUpdateData({
        amount: 0,
        type: "deposit",
        description: "",
      });

      alert(
        `Balance ${balanceUpdateData.type} of $${balanceUpdateData.amount} successful!`
      );
    } catch (error: any) {
      dispatch(setError(error.message));
      alert(`Failed to update balance: ${error.message}`);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        dispatch(setLoading(true));
        await AgentService.deactivateUser(userId);
        dispatch(removeManagedUser(userId));
      } catch (error: any) {
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const handleUpdateBetStatus = async (
    betId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      dispatch(setLoading(true));
      const updatedBet = await AgentService.updateBetStatus(betId, status);
      dispatch(updateAgentBet(updatedBet));
    } catch (error: any) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (isLoading) {
    return (
      <div className="agent-page">
        <Header onNavigate={onNavigate} currentPage="agent" />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-page">
      <Header onNavigate={onNavigate} currentPage="agent" />

      {/* Page Title */}
      <div className="page-header">
        <h1>👨‍💼 Agent Dashboard</h1>
        <p>Manage your users and place bets on their behalf</p>
      </div>

      {/* Stats Overview */}
      <div className="agent-stats">
        <div className="stat-card">
          <div className="stat-icon users-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-label">Managed Users</h3>
            <p className="stat-value">{managedUsers.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active-icon">✅</div>
          <div className="stat-content">
            <h3 className="stat-label">Active Users</h3>
            <p className="stat-value">
              {managedUsers.filter((u) => u.isActive).length}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon balance-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-label">Total Balance</h3>
            <p className="stat-value">
              $
              {managedUsers
                .reduce((sum, user) => sum + user.balance, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-label">Total Users</h3>
            <p className="stat-value">{managedUsers.length}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="agent-tabs">
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <span className="tab-icon">👥</span>
          <span className="tab-label">Managed Users</span>
        </button>
        <button
          className={`tab-button ${activeTab === "bets" ? "active" : ""}`}
          onClick={() => setActiveTab("bets")}
        >
          <span className="tab-icon">🎯</span>
          <span className="tab-label">Bets</span>
        </button>
        <button
          className={`tab-button ${
            activeTab === "commissions" ? "active" : ""
          }`}
          onClick={() => setActiveTab("commissions")}
        >
          <span className="tab-icon">💰</span>
          <span className="tab-label">Commissions</span>
        </button>
        <button
          className={`tab-button ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Statistics</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "users" && (
          <div className="users-tab">
            <div className="tab-header">
              <h2 className="tab-title">Managed Users</h2>
              <div className="tab-header-actions">
                <button
                  className="btn btn-secondary refresh-btn"
                  onClick={loadAgentData}
                  disabled={isLoading}
                >
                  <span className="btn-icon">🔄</span>
                  {isLoading ? "Loading..." : "Refresh"}
                </button>
                <button
                  className="btn btn-primary add-user-btn"
                  onClick={() => setShowCreateUser(true)}
                >
                  <span className="btn-icon">+</span>
                  Add New User
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading managed users...</p>
              </div>
            ) : managedUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Managed Users</h3>
                <p>
                  You haven't created any users yet. Click "Add New User" to get
                  started.
                </p>
              </div>
            ) : (
              <div className="users-table-container">
                <div className="users-table-header">
                  <div className="table-col col-user">User</div>
                  <div className="table-col col-country">Country</div>
                  <div className="table-col col-balance">Balance</div>
                  <div className="table-col col-status">Status</div>
                  <div className="table-col col-activity">Last Activity</div>
                  <div className="table-col col-actions">Actions</div>
                </div>
                <div className="users-table-body">
                  {managedUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`user-row ${
                        selectedUser?.id === user.id ? "selected" : ""
                      }`}
                    >
                      <div className="table-col col-user">
                        <div className="user-info">
                          <div className="user-avatar">
                            <span className="user-avatar-text">
                              {user.phone_number.charAt(1).toUpperCase()}
                            </span>
                          </div>
                          <div className="user-details">
                            <span className="user-phone">
                              {user.phone_number}
                            </span>
                            <span className="user-id">ID: {user.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="table-col col-country">
                        <span className="country-info">
                          {user.country_code} • {user.currency}
                        </span>
                      </div>
                      <div className="table-col col-balance">
                        <span className="balance-amount">
                          ${user.balance.toFixed(2)}
                        </span>
                      </div>
                      <div className="table-col col-status">
                        <span
                          className={`status-badge ${
                            user.isActive ? "active" : "inactive"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="table-col col-activity">
                        <span className="activity-date">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                      <div className="table-col col-actions">
                        <div className="user-actions">
                          <button
                            className="action-btn select-btn"
                            onClick={() => {
                              dispatch(setSelectedUser(user));
                              setActiveTab("bets");
                            }}
                            title="Select user and go to bets tab"
                          >
                            Place Bet
                          </button>
                          <button
                            className="action-btn balance-btn"
                            onClick={() => {
                              setSelectedUserForBalance(user);
                              setShowBalanceUpdate(true);
                            }}
                            title="Update user balance"
                          >
                            Balance
                          </button>
                          <button
                            className="action-btn deactivate-btn"
                            onClick={() => handleDeactivateUser(user.id)}
                            title="Deactivate user"
                          >
                            Deactivate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "bets" && (
          <div className="bets-tab">
            <div className="tab-header">
              <h2 className="tab-title">Agent Bets</h2>
              <div className="tab-header-actions">
                <select
                  value={betStatusFilter}
                  onChange={(e) => {
                    setBetStatusFilter(
                      e.target.value as
                        | "all"
                        | "pending"
                        | "accepted"
                        | "rejected"
                        | "settled"
                    );
                    // Reload data when filter changes
                    setTimeout(loadAgentData, 100);
                  }}
                  className="form-input status-filter"
                >
                  <option value="all">All Bets</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="settled">Settled</option>
                </select>
                <button
                  className="btn btn-secondary refresh-btn"
                  onClick={loadAgentData}
                  disabled={isLoading}
                >
                  <span className="btn-icon">🔄</span>
                  {isLoading ? "Loading..." : "Refresh"}
                </button>
                <button
                  className="btn btn-success place-bet-btn"
                  onClick={() => onNavigate("games")}
                >
                  <span className="btn-icon">🎯</span>
                  Place Bet
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading agent bets...</p>
              </div>
            ) : agentBets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <h3>No Bets Found</h3>
                <p>
                  {betStatusFilter === "all"
                    ? "No bets have been placed yet. Click 'Place Bet' to create your first bet."
                    : `No ${betStatusFilter} bets found. Try changing the filter or place a new bet.`}
                </p>
              </div>
            ) : (
              <div className="bets-table-container">
                <div className="bets-table-header">
                  <div className="table-col col-bet-id">Bet ID</div>
                  <div className="table-col col-user">User</div>
                  <div className="table-col col-game">Game</div>
                  <div className="table-col col-selection">Selection</div>
                  <div className="table-col col-stake">Stake</div>
                  <div className="table-col col-potential">Potential</div>
                  <div className="table-col col-status">Status</div>
                  <div className="table-col col-date">Date</div>
                  <div className="table-col col-bet-actions">Actions</div>
                </div>
                <div className="bets-table-body">
                  {agentBets.map((bet) => (
                    <div key={bet.id} className="bet-row-container">
                      <div
                        className="bet-row"
                        onClick={() => toggleBetExpansion(bet.id)}
                      >
                        <div className="table-col col-bet-id">
                          <div className="bet-id-container">
                            <button className="expand-btn">
                              {expandedBets.has(bet.id) ? "▼" : "▶"}
                            </button>
                            <span className="bet-id-short" title={bet.id}>
                              {bet.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                        <div className="table-col col-user">
                          <div className="user-info">
                            <span className="user-phone">{bet.userPhone}</span>
                            <span className="user-country">
                              {bet.userCountry}
                            </span>
                          </div>
                        </div>
                        <div className="table-col col-game">
                          <div className="game-info">
                            <span className="bet-type-badge">
                              {bet.betType}
                            </span>
                            {bet.betType === "single" ? (
                              <>
                                <span className="teams">
                                  {bet.selections[0]?.homeTeam} vs{" "}
                                  {bet.selections[0]?.awayTeam}
                                </span>
                                <span className="game-id">
                                  {bet.selections[0]?.gameId}
                                </span>
                              </>
                            ) : (
                              <span className="multibet-info">
                                {bet.selections.length} selections
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="table-col col-selection">
                          <div className="selection-info">
                            {bet.betType === "single" ? (
                              <>
                                <span className="selection-text">
                                  {bet.selections[0]?.selection}
                                </span>
                                <span className="odds">
                                  @ {bet.selections[0]?.odds}
                                </span>
                              </>
                            ) : (
                              <span className="multibet-odds">
                                Combined @{" "}
                                {(
                                  bet.potentialWinnings / bet.totalStake
                                ).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="table-col col-stake">
                          <span className="stake-amount">
                            ${bet.totalStake}
                          </span>
                        </div>
                        <div className="table-col col-potential">
                          <span className="potential-amount">
                            ${bet.potentialWinnings.toFixed(2)}
                          </span>
                        </div>
                        <div className="table-col col-status">
                          <span className={`status-badge ${bet.status}`}>
                            {bet.status}
                          </span>
                        </div>
                        <div className="table-col col-date">
                          <span className="bet-date">
                            {new Date(bet.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="table-col col-bet-actions">
                          <div className="bet-actions">
                            <button
                              className="action-btn print-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const combinedOdds =
                                  (bet as any).combinedOdds ||
                                  (bet.selections?.length > 0
                                    ? bet.selections.reduce(
                                        (total, selection) =>
                                          total * selection.odds,
                                        1
                                      )
                                    : undefined);
                                printThermalTicket(bet, combinedOdds);
                              }}
                              title="Print Thermal Ticket"
                            >
                              🖨️
                            </button>
                            <button
                              className="action-btn view-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBetTicket(bet);
                                setShowBetTicket(true);
                              }}
                              title="View Bet Ticket"
                            >
                              👁️
                            </button>
                            {bet.status === "pending" && (
                              <>
                                <button
                                  className="action-btn accept-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateBetStatus(bet.id, "accepted");
                                  }}
                                  title="Accept Bet"
                                >
                                  ✅
                                </button>
                                <button
                                  className="action-btn reject-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateBetStatus(bet.id, "rejected");
                                  }}
                                  title="Reject Bet"
                                >
                                  ❌
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Accordion for Bet Details */}
                      {expandedBets.has(bet.id) && (
                        <div className="bet-details-accordion">
                          <div className="bet-details-header">
                            <h4>Bet Details</h4>
                            <div className="bet-summary">
                              <span className="bet-type">
                                Type: {bet.betType}
                              </span>
                              <span className="bet-stake">
                                Stake: SSP ${bet.totalStake}
                              </span>
                              <span className="bet-potential">
                                Potential: SSP $
                                {bet.potentialWinnings.toFixed(2)}
                              </span>
                              {bet.betType === "multibet" && (
                                <span className="combined-odds">
                                  Combined Odds:{" "}
                                  {(
                                    bet.potentialWinnings / bet.totalStake
                                  ).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="selections-container">
                            <h5>Selections ({bet.selections.length})</h5>
                            <div className="selections-grid">
                              {bet.selections.map((selection, index) => (
                                <div key={index} className="selection-card">
                                  <div className="selection-header">
                                    <span className="selection-number">
                                      #{index + 1}
                                    </span>
                                    <span className="game-id">
                                      {selection.gameId}
                                    </span>
                                  </div>
                                  <div className="match-info">
                                    <div className="teams">
                                      <span className="home-team">
                                        {selection.homeTeam}
                                      </span>
                                      <span className="vs">vs</span>
                                      <span className="away-team">
                                        {selection.awayTeam}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="bet-info">
                                    <div className="bet-type-selection">
                                      <span className="bet-type-label">
                                        Bet Type:
                                      </span>
                                      <span className="bet-type-value">
                                        {selection.betType}
                                      </span>
                                    </div>
                                    <div className="selection-choice">
                                      <span className="selection-label">
                                        Selection:
                                      </span>
                                      <span className="selection-value">
                                        {selection.selection}
                                      </span>
                                    </div>
                                    <div className="odds-info">
                                      <span className="odds-label">Odds:</span>
                                      <span className="odds-value">
                                        {selection.odds}
                                      </span>
                                    </div>
                                    {selection.stake && (
                                      <div className="selection-stake">
                                        <span className="stake-label">
                                          Stake:
                                        </span>
                                        <span className="stake-value">
                                          ${selection.stake.toFixed(2)}
                                        </span>
                                      </div>
                                    )}
                                    {selection.potentialWinnings && (
                                      <div className="selection-potential">
                                        <span className="potential-label">
                                          Potential:
                                        </span>
                                        <span className="potential-value">
                                          $
                                          {selection.potentialWinnings.toFixed(
                                            2
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bet-metadata">
                            <div className="metadata-row">
                              <span className="metadata-label">
                                Full Bet ID:
                              </span>
                              <span className="metadata-value">{bet.id}</span>
                            </div>
                            <div className="metadata-row">
                              <span className="metadata-label">User ID:</span>
                              <span className="metadata-value">
                                {bet.userId}
                              </span>
                            </div>
                            <div className="metadata-row">
                              <span className="metadata-label">Agent ID:</span>
                              <span className="metadata-value">
                                {bet.agentId}
                              </span>
                            </div>
                            <div className="metadata-row">
                              <span className="metadata-label">Created:</span>
                              <span className="metadata-value">
                                {new Date(bet.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {bet.settledAt && (
                              <div className="metadata-row">
                                <span className="metadata-label">Settled:</span>
                                <span className="metadata-value">
                                  {new Date(bet.settledAt).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {bet.cancelledAt && (
                              <div className="metadata-row">
                                <span className="metadata-label">
                                  Cancelled:
                                </span>
                                <span className="metadata-value">
                                  {new Date(bet.cancelledAt).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "commissions" && (
          <div className="commissions-tab">
            <div className="tab-header">
              <h2 className="tab-title">Commission Transactions</h2>
            </div>

            <div className="commissions-list">
              {commissionTransactions.map((transaction) => (
                <div key={transaction.id} className="commission-card">
                  <div className="commission-card-header">
                    <div className="commission-user">
                      <span className="commission-user-name">
                        {transaction.userName}
                      </span>
                      <span className="commission-percentage">
                        {transaction.percentage}%
                      </span>
                    </div>
                    <div className="commission-amount">
                      +${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="commission-card-body">
                    <div className="commission-details">
                      <span className="commission-bet-id">
                        Bet ID: {transaction.betId}
                      </span>
                      <span className="commission-date">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="stats-tab">
            <div className="tab-header">
              <h2 className="tab-title">Detailed Statistics</h2>
            </div>
            <div className="stats-grid">
              <div className="stats-card">
                <h3>Performance Overview</h3>
                <div className="stats-metrics">
                  <div className="metric">
                    <span className="metric-label">Success Rate</span>
                    <span className="metric-value">85%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Avg Commission</span>
                    <span className="metric-value">
                      $
                      {(totalCommission / Math.max(totalBetsPlaced, 1)).toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="stats-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">🎯</span>
                    <span className="activity-text">
                      Bet placed for John Doe
                    </span>
                    <span className="activity-time">2h ago</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">💰</span>
                    <span className="activity-text">
                      Commission earned SSP 25.50
                    </span>
                    <span className="activity-time">4h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="modal-overlay" onClick={() => setShowCreateUser(false)}>
          <div
            className="modal-content agent-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Create New User</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateUser(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="userPhone">Phone Number</label>
                <input
                  id="userPhone"
                  type="tel"
                  placeholder="Enter phone number (e.g., +254712345678)"
                  value={newUser.phone_number}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone_number: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="countryCode">Country Code</label>
                <select
                  id="countryCode"
                  value={newUser.country_code}
                  onChange={(e) =>
                    setNewUser({ ...newUser, country_code: e.target.value })
                  }
                  className="form-input"
                >
                  <option value="KE">Kenya (KE)</option>
                  <option value="US">United States (US)</option>
                  <option value="UK">United Kingdom (UK)</option>
                  <option value="NG">Nigeria (NG)</option>
                  <option value="ZA">South Africa (ZA)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="userPassword">Password</label>
                <input
                  id="userPassword"
                  type="password"
                  placeholder="Enter user password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="commissionRate">Commission Rate (%)</label>
                <input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="Enter commission rate (0.08 = 8%)"
                  value={newUser.commission_rate}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      commission_rate: Number(e.target.value),
                    })
                  }
                  className="form-input"
                />
                <small className="form-help">
                  Current: {(newUser.commission_rate * 100).toFixed(1)}%
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowCreateUser(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateUser}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bet Ticket Modal */}
      {showBetTicket && selectedBetTicket && (
        <div className="modal-overlay" onClick={() => setShowBetTicket(false)}>
          <div
            className="modal-content bet-ticket-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Bet Ticket</h3>
              <button
                className="modal-close"
                onClick={() => setShowBetTicket(false)}
              >
                ✕
              </button>
            </div>
            <div className="bet-ticket">
              <div className="ticket-header">
                <div className="ticket-logo">🎯 Betzone</div>
                <div className="ticket-id">
                  <strong>Bet ID:</strong> {selectedBetTicket.id}
                </div>
              </div>

              <div className="ticket-section">
                <h4>User Information</h4>
                <div className="ticket-row">
                  <span>Phone:</span>
                  <span>{selectedBetTicket.userPhone}</span>
                </div>
                <div className="ticket-row">
                  <span>Country:</span>
                  <span>{selectedBetTicket.userCountry}</span>
                </div>
              </div>

              <div className="ticket-section">
                <h4>Bet Details</h4>
                <div className="ticket-row">
                  <span>Type:</span>
                  <span className="bet-type-badge">
                    {selectedBetTicket.betType}
                  </span>
                </div>
                <div className="ticket-row">
                  <span>Status:</span>
                  <span className={`status-badge ${selectedBetTicket.status}`}>
                    {selectedBetTicket.status}
                  </span>
                </div>
                <div className="ticket-row">
                  <span>Total Stake:</span>
                  <span className="amount">
                    ${selectedBetTicket.totalStake}
                  </span>
                </div>
                <div className="ticket-row">
                  <span>Potential Winnings:</span>
                  <span className="amount potential">
                    ${selectedBetTicket.potentialWinnings}
                  </span>
                </div>
              </div>

              <div className="ticket-section">
                <h4>Selections</h4>
                {selectedBetTicket.selections.map((selection, index) => (
                  <div key={index} className="selection-card">
                    <div className="selection-header">
                      <span className="game-id">{selection.gameId}</span>
                      <span className="odds">@ {selection.odds}</span>
                    </div>
                    <div className="selection-teams">
                      {selection.homeTeam} vs {selection.awayTeam}
                    </div>
                    <div className="selection-bet">
                      <span className="bet-type">{selection.betType}:</span>
                      <span className="selection-text">
                        {selection.selection}
                      </span>
                    </div>
                    <div className="selection-stake">
                      Stake: SSP ${selection.stake} → Potential: SSP
                      {selection.potentialWinnings}
                    </div>
                  </div>
                ))}
              </div>

              <div className="ticket-section">
                <h4>Timestamps</h4>
                <div className="ticket-row">
                  <span>Created:</span>
                  <span>
                    {new Date(selectedBetTicket.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="ticket-row">
                  <span>Updated:</span>
                  <span>
                    {new Date(selectedBetTicket.updatedAt).toLocaleString()}
                  </span>
                </div>
                {selectedBetTicket.settledAt && (
                  <div className="ticket-row">
                    <span>Settled:</span>
                    <span>
                      {new Date(selectedBetTicket.settledAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedBetTicket.cancelledAt && (
                  <div className="ticket-row">
                    <span>Cancelled:</span>
                    <span>
                      {new Date(selectedBetTicket.cancelledAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="ticket-footer">
                <div className="ticket-disclaimer">
                  This is an official bet ticket. Keep this for your records.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowBetTicket(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const combinedOdds =
                    (selectedBetTicket as any).combinedOdds ||
                    (selectedBetTicket.selections?.length > 0
                      ? selectedBetTicket.selections.reduce(
                          (total, selection) => total * selection.odds,
                          1
                        )
                      : undefined);
                  printThermalTicket(selectedBetTicket, combinedOdds);
                }}
              >
                🖨️ Print Thermal Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Update Modal */}
      {showBalanceUpdate && selectedUserForBalance && (
        <div
          className="modal-overlay"
          onClick={() => setShowBalanceUpdate(false)}
        >
          <div
            className="modal-content balance-update-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Update User Balance</h3>
              <button
                className="modal-close"
                onClick={() => setShowBalanceUpdate(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="user-info-section">
                <div className="user-avatar">
                  <span className="user-avatar-text">
                    {selectedUserForBalance.phone_number
                      .charAt(1)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="user-details">
                  <h4>{selectedUserForBalance.phone_number}</h4>
                  <p>
                    Current Balance:{" "}
                    <strong>
                      ${selectedUserForBalance.balance.toFixed(2)}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="balance-form">
                <div className="form-group">
                  <label>Transaction Type</label>
                  <select
                    value={balanceUpdateData.type}
                    onChange={(e) =>
                      setBalanceUpdateData({
                        ...balanceUpdateData,
                        type: e.target.value as "deposit" | "withdrawal",
                      })
                    }
                    className="form-input"
                  >
                    <option value="deposit">Deposit (Add Money)</option>
                    <option value="withdrawal">
                      Withdrawal (Remove Money)
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    value={balanceUpdateData.amount}
                    onChange={(e) =>
                      setBalanceUpdateData({
                        ...balanceUpdateData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="form-input"
                    placeholder="Enter amount"
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={balanceUpdateData.description}
                    onChange={(e) =>
                      setBalanceUpdateData({
                        ...balanceUpdateData,
                        description: e.target.value,
                      })
                    }
                    className="form-input"
                    placeholder="e.g., Customer deposit, Withdrawal request"
                  />
                </div>

                <div className="balance-preview">
                  <div className="preview-row">
                    <span>Current Balance:</span>
                    <span>${selectedUserForBalance.balance.toFixed(2)}</span>
                  </div>
                  <div className="preview-row">
                    <span>
                      {balanceUpdateData.type === "deposit"
                        ? "Add:"
                        : "Remove:"}
                    </span>
                    <span
                      className={
                        balanceUpdateData.type === "deposit"
                          ? "positive"
                          : "negative"
                      }
                    >
                      {balanceUpdateData.type === "deposit" ? "+" : "-"}$
                      {balanceUpdateData.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="preview-row total">
                    <span>New Balance:</span>
                    <span>
                      $
                      {(balanceUpdateData.type === "deposit"
                        ? selectedUserForBalance.balance +
                          balanceUpdateData.amount
                        : selectedUserForBalance.balance -
                          balanceUpdateData.amount
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowBalanceUpdate(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdateBalance}
                disabled={
                  balanceUpdateData.amount <= 0 ||
                  !balanceUpdateData.description.trim()
                }
              >
                {balanceUpdateData.type === "deposit" ? "💰" : "💸"} Update
                Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
