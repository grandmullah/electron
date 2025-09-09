import React, { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../store/authSlice";
import {
  addToBetSlip,
  removeFromBetSlip,
  updateBetSlipStake,
  clearBetSlip,
  toggleBetSlipVisibility,
  hideBetSlip,
  toggleMultibetMode,
  enableMultibetMode,
  setMultibetStake,
  setMultibetStakeFromLimits,
  BetSlipItem,
} from "../store/betslipSlice";
import { placeBets } from "../services/betslipService";
import AuthService from "../services/authService";
import AgentService from "../services/agentService";
import { addAgentBet } from "../store/agentSlice";
import BetSlipSummary from "./BetSlipSummary";
import { BetSlipService } from "../services/betslipService";
import { MUIBetSlip } from "./MUIBetSlip";

interface HeaderProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
  currentPage: string;
  selectedUser?: { id: string; phone_number: string } | null;
  isAgentMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentPage,
  selectedUser,
  isAgentMode = false,
}) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const {
    items: betSlipItems,
    isVisible: isBetSlipVisible,
    isMultibetMode,
    multibetStake,
  } = useAppSelector((state) => state.betslip);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-enable multibet mode when multiple selections are added
  useEffect(() => {
    if (betSlipItems.length > 1 && !isMultibetMode) {
      // Automatically switch to multibet mode for multiple selections
      dispatch(enableMultibetMode());
    }
  }, [betSlipItems.length, isMultibetMode, dispatch]);

  // Update multibet stake based on user betting limits
  useEffect(() => {
    if (user?.bettingLimits) {
      const { minStake, maxStake } = user.bettingLimits;
      dispatch(setMultibetStakeFromLimits({ minStake, maxStake }));
    }
  }, [user?.bettingLimits, dispatch]);

  const handleLogout = () => {
    AuthService.logout();
    dispatch(logout());
  };

  const getObscuredPhoneNumber = (phoneNumber: string) => {
    // Extract country code and last 2 digits
    if (phoneNumber.startsWith("+")) {
      const cleanNumber = phoneNumber.substring(1);
      if (cleanNumber.length >= 4) {
        const countryCode = cleanNumber.substring(0, 3); // First 3 digits as country code
        const lastDigits = cleanNumber.slice(-2); // Last 2 digits
        return `${countryCode} *** ${lastDigits}`;
      }
    }
    // Fallback for non-standard format
    return phoneNumber.length > 4
      ? `${phoneNumber.substring(0, 3)} *** ${phoneNumber.slice(-2)}`
      : phoneNumber;
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Betzone</h1>
          <nav className="nav-menu">
            <button
              className={`nav-item ${currentPage === "home" ? "active" : ""}`}
              onClick={() => onNavigate("home")}
            >
              Home
            </button>
            <button
              className={`nav-item ${currentPage === "games" ? "active" : ""}`}
              onClick={() => onNavigate("games")}
            >
              Games
            </button>
            <button
              className={`nav-item ${
                currentPage === "dashboard" ? "active" : ""
              }`}
              onClick={() => onNavigate("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`nav-item ${
                currentPage === "settings" ? "active" : ""
              }`}
              onClick={() => onNavigate("settings")}
            >
              Settings
            </button>
            <button
              className={`nav-item ${
                currentPage === "history" ? "active" : ""
              }`}
              onClick={() => onNavigate("history")}
            >
              History
            </button>
            {user && user.role === "agent" && (
              <button
                className={`nav-item ${
                  currentPage === "agent" ? "active" : ""
                }`}
                onClick={() => onNavigate("agent")}
              >
                Agent
              </button>
            )}
          </nav>
        </div>

        <div className="header-right">
          {/* Bet Slip Button */}
          {betSlipItems.length > 0 && (
            <button
              className="btn btn-primary betslip-btn"
              onClick={() => dispatch(toggleBetSlipVisibility())}
            >
              <span className="betslip-icon">📋</span>
              <span className="betslip-count">{betSlipItems.length}</span>
            </button>
          )}

          {user && (
            <div className="user-section" ref={dropdownRef}>
              <div className="user-info-display">
                <div className="user-name-role">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role-badge">{user.role}</span>
                </div>
                <div className="user-balance-display">
                  <span className="balance-label">Balance:</span>
                  <span className="balance-amount">
                    {user.currency} {user.balance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div
                className="user-avatar-container"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <div className="user-avatar">
                  <span className="avatar-text">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="dropdown-arrow">
                  {showUserDropdown ? "▲" : "▼"}
                </span>
              </div>

              {showUserDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      <span className="dropdown-avatar-text">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-name">{user.name}</span>
                      <span className="dropdown-role">{user.role}</span>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  {/* Basic User Info */}
                  <div className="dropdown-item">
                    <span className="dropdown-label">User ID</span>
                    <span className="dropdown-value">{user.id}</span>
                  </div>

                  <div className="dropdown-item">
                    <span className="dropdown-label">Phone Number</span>
                    <span className="dropdown-value">{user.phoneNumber}</span>
                  </div>

                  <div className="dropdown-item">
                    <span className="dropdown-label">Status</span>
                    <span
                      className={`dropdown-value status-badge ${user.isActive ? "active" : "inactive"}`}
                    >
                      {user.isActive ? "🟢 Active" : "🔴 Inactive"}
                    </span>
                  </div>

                  <div className="dropdown-item">
                    <span className="dropdown-label">Balance</span>
                    <span className="dropdown-value balance-value">
                      {user.currency} {user.balance.toFixed(2)}
                    </span>
                  </div>

                  {/* Shop Information */}
                  {user.shop && (
                    <>
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-section-header">
                        Shop Information
                      </div>

                      <div className="dropdown-item">
                        <span className="dropdown-label">Shop Name</span>
                        <span className="dropdown-value">
                          {user.shop.shop_name}
                        </span>
                      </div>

                      <div className="dropdown-item">
                        <span className="dropdown-label">Shop Code</span>
                        <span className="dropdown-value">
                          {user.shop.shop_code}
                        </span>
                      </div>

                      {user.shop.shop_address && (
                        <div className="dropdown-item">
                          <span className="dropdown-label">Shop Address</span>
                          <span className="dropdown-value">
                            {user.shop.shop_address}
                          </span>
                        </div>
                      )}

                      <div className="dropdown-item">
                        <span className="dropdown-label">Default Currency</span>
                        <span className="dropdown-value">
                          {user.shop.default_currency}
                        </span>
                      </div>

                      {user.role === "agent" && (
                        <div className="dropdown-item">
                          <span className="dropdown-label">
                            Commission Rate
                          </span>
                          <span className="dropdown-value">
                            {user.shop.commission_rate}%
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Agent Information */}
                  {user.role === "agent" && (
                    <>
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-section-header">
                        Agent Information
                      </div>

                      {user.commission && (
                        <div className="dropdown-item">
                          <span className="dropdown-label">Commission</span>
                          <span className="dropdown-value">
                            {user.commission}%
                          </span>
                        </div>
                      )}

                      {user.managedUsers && user.managedUsers.length > 0 && (
                        <div className="dropdown-item">
                          <span className="dropdown-label">Managed Users</span>
                          <span className="dropdown-value">
                            {user.managedUsers.length} users
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Betting Limits */}
                  {user.bettingLimits && (
                    <>
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-section-header">
                        Betting Limits
                      </div>

                      <div className="dropdown-item">
                        <span className="dropdown-label">Min Stake</span>
                        <span className="dropdown-value">
                          {user.currency}{" "}
                          {user.bettingLimits.minStake.toFixed(2)}
                        </span>
                      </div>

                      <div className="dropdown-item">
                        <span className="dropdown-label">Max Stake</span>
                        <span className="dropdown-value">
                          {user.currency}{" "}
                          {user.bettingLimits.maxStake.toFixed(2)}
                        </span>
                      </div>

                      <div className="dropdown-item">
                        <span className="dropdown-label">Max Daily Loss</span>
                        <span className="dropdown-value">
                          {user.currency}{" "}
                          {user.bettingLimits.maxDailyLoss.toFixed(2)}
                        </span>
                      </div>

                      <div className="dropdown-item">
                        <span className="dropdown-label">Max Weekly Loss</span>
                        <span className="dropdown-value">
                          {user.currency}{" "}
                          {user.bettingLimits.maxWeeklyLoss.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* User Preferences */}
                  {user.preferences && (
                    <>
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-section-header">Preferences</div>

                      <div className="dropdown-item">
                        <span className="dropdown-label">Odds Format</span>
                        <span className="dropdown-value">
                          {user.preferences.oddsFormat}
                        </span>
                      </div>

                      <div className="dropdown-item">
                        <span className="dropdown-label">Timezone</span>
                        <span className="dropdown-value">
                          {user.preferences.timezone}
                        </span>
                      </div>

                      {/* Notification Preferences */}
                      <div className="dropdown-item">
                        <span className="dropdown-label">Notifications</span>
                        <span className="dropdown-value">
                          {user.preferences.notifications.betSettled
                            ? "✅"
                            : "❌"}{" "}
                          Bet Settled
                          {user.preferences.notifications.oddsChanged
                            ? " ✅"
                            : " ❌"}{" "}
                          Odds Changed
                          {user.preferences.notifications.newGames
                            ? " ✅"
                            : " ❌"}{" "}
                          New Games
                        </span>
                      </div>
                    </>
                  )}

                  {/* Account Details */}
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-section-header">Account Details</div>

                  <div className="dropdown-item">
                    <span className="dropdown-label">User ID</span>
                    <span className="dropdown-value">{user.id}</span>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-logout-btn"
                    onClick={() => {
                      handleLogout();
                      setShowUserDropdown(false);
                    }}
                  >
                    <span className="logout-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Material-UI Bet Slip Modal */}
      <MUIBetSlip
        isVisible={isBetSlipVisible}
        onClose={() => dispatch(hideBetSlip())}
        selectedUser={selectedUser}
        isAgentMode={isAgentMode}
      />
    </>
  );
};
