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
  const [isPlacingBets, setIsPlacingBets] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [betSlipData, setBetSlipData] = useState<any>(null);
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

  // Fetch betslip data when selections change
  useEffect(() => {
    const fetchBetSlipData = async () => {
      if (betSlipItems.length > 0) {
        try {
          const stake =
            betSlipItems.length > 1
              ? multibetStake
              : betSlipItems[0]?.stake || 0;
          const response = await BetSlipService.createBetSlip(
            betSlipItems,
            stake,
            user?.id
          );
          if (response.success) {
            setBetSlipData(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch betslip data:", error);
        }
      } else {
        setBetSlipData(null);
      }
    };

    fetchBetSlipData();
  }, [betSlipItems, multibetStake, user?.id]);

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

  // Bet slip helper functions
  const calculateCombinedOdds = (bets: BetSlipItem[]): number => {
    if (bets.length === 0) return 1;
    return bets.reduce((combined, bet) => combined * bet.odds, 1);
  };

  const calculateMultibetWinnings = (
    bets: BetSlipItem[],
    stake: number
  ): number => {
    const combinedOdds = calculateCombinedOdds(bets);
    return stake * combinedOdds;
  };

  // Tax calculation functions
  const TAX_RATE = 0.2; // 20% tax rate

  const calculateTaxAmount = (potentialWinnings: number): number => {
    return potentialWinnings * TAX_RATE;
  };

  const calculateNetWinnings = (potentialWinnings: number): number => {
    return potentialWinnings - calculateTaxAmount(potentialWinnings);
  };

  // Enhanced validation function that uses user's betting limits
  const validateBetslipWithLimits = (
    bets: BetSlipItem[],
    isMultibet: boolean,
    stake: number
  ) => {
    if (bets.length === 0) {
      return { isValid: false, error: "No bets in slip" };
    }

    // Check for conflicting bets (same game, different outcomes)
    const gameSelections = new Map<string, Set<string>>();
    for (const bet of bets) {
      if (!gameSelections.has(bet.gameId)) {
        gameSelections.set(bet.gameId, new Set());
      }
      gameSelections.get(bet.gameId)!.add(bet.selection);
    }

    for (const [gameId, selections] of gameSelections) {
      if (selections.size > 1) {
        const game = bets.find((b) => b.gameId === gameId);
        return {
          isValid: false,
          error: `Conflicting selections for ${game?.homeTeam} vs ${game?.awayTeam}`,
        };
      }
    }

    // Multibet specific validation
    if (isMultibet) {
      if (bets.length < 2) {
        return {
          isValid: false,
          error: "Multibet requires at least 2 selections",
        };
      }
      if (bets.length > 20) {
        return {
          isValid: false,
          error: "Multibet cannot exceed 20 selections",
        };
      }
    }

    // Validate stakes against user limits
    if (user?.bettingLimits) {
      const { minStake, maxStake } = user.bettingLimits;
      const currency = user.currency;

      if (isMultibet) {
        // For multibet, validate total stake
        if (stake < minStake) {
          return {
            isValid: false,
            error: `Minimum stake is ${currency} ${minStake.toFixed(2)}`,
          };
        }
        if (stake > maxStake) {
          return {
            isValid: false,
            error: `Maximum stake is ${currency} ${maxStake.toFixed(2)}`,
          };
        }
      } else {
        // For single bets, validate individual stakes
        for (const bet of bets) {
          if (bet.stake < minStake) {
            return {
              isValid: false,
              error: `Bet on ${bet.homeTeam} vs ${bet.awayTeam}: Minimum stake is ${currency} ${minStake.toFixed(2)}`,
            };
          }
          if (bet.stake > maxStake) {
            return {
              isValid: false,
              error: `Bet on ${bet.homeTeam} vs ${bet.awayTeam}: Maximum stake is ${currency} ${maxStake.toFixed(2)}`,
            };
          }
        }
      }
    }

    return { isValid: true, error: "" };
  };

  // Legacy validation function for backward compatibility
  const validateMultibet = (bets: BetSlipItem[]) => {
    if (bets.length < 2) {
      return {
        isValid: false,
        error: "Multibet requires at least 2 selections",
      };
    }
    if (bets.length > 20) {
      return { isValid: false, error: "Multibet cannot exceed 20 selections" };
    }
    return { isValid: true, error: "" };
  };

  const handlePlaceBets = async () => {
    if (betSlipItems.length === 0) {
      alert("No bets in slip");
      return;
    }

    // If agent mode, check if user is selected
    if (isAgentMode && !selectedUser) {
      alert("Please select a user to place bets for");
      return;
    }

    setIsPlacingBets(true);

    try {
      if (isAgentMode && selectedUser) {
        // Agent mode - place bets for selected user
        if (betSlipItems.length > 1) {
          // Always place multiple selections as multibet for agent
          try {
            const agentBet = await AgentService.placeBetForUser({
              userId: selectedUser.id,
              betType: "multibet",
              stake: multibetStake,
              selections: betSlipItems.map((bet) => ({
                gameId: bet.gameId,
                homeTeam: bet.homeTeam,
                awayTeam: bet.awayTeam,
                betType: bet.betType,
                selection: bet.selection,
                odds: bet.odds,
                bookmaker: bet.bookmaker,
                gameTime: bet.gameTime,
                sportKey: bet.sportKey,
              })),
            });

            // Add the bet to the Redux store
            dispatch(addAgentBet(agentBet));

            const combinedOdds = calculateCombinedOdds(betSlipItems);
            const potentialWinnings = multibetStake * combinedOdds;
            const selections = betSlipItems
              .map(
                (bet, index) =>
                  `${index + 1}. ${bet.homeTeam} vs ${bet.awayTeam} (${bet.betType}: ${bet.selection}) @ ${bet.odds}`
              )
              .join("\n");

            const taxAmount = calculateTaxAmount(potentialWinnings);
            const netWinnings = calculateNetWinnings(potentialWinnings);
            const taxInfo = `\nTax: ${(TAX_RATE * 100).toFixed(0)}% (SSP ${taxAmount.toFixed(2)})
Net Winnings: SSP ${netWinnings.toFixed(2)}`;

            alert(`🎯 SUCCESSFULLY PLACED MULTIBET FOR AGENT USER! 🎯

User: ${selectedUser.phone_number}
Stake: SSP ${multibetStake.toFixed(2)}
Combined Odds: ${combinedOdds.toFixed(2)}
Potential Winnings: SSP ${potentialWinnings.toFixed(2)}${taxInfo}

Selections:
${selections}`);
          } catch (error: any) {
            console.error(`Failed to place multibet:`, error);
            throw new Error(`Failed to place multibet: ${error.message}`);
          }
        } else {
          // Place as individual single bet for agent
          if (betSlipItems.length === 1) {
            const bet = betSlipItems[0];
            if (bet) {
              try {
                const agentBet = await AgentService.placeBetForUser({
                  userId: selectedUser.id,
                  betType: "single",
                  stake: bet.stake,
                  selections: [
                    {
                      gameId: bet.gameId,
                      homeTeam: bet.homeTeam,
                      awayTeam: bet.awayTeam,
                      betType: bet.betType,
                      selection: bet.selection,
                      odds: bet.odds,
                      bookmaker: bet.bookmaker,
                      gameTime: bet.gameTime,
                      sportKey: bet.sportKey,
                    },
                  ],
                });
                // Add the bet to the Redux store
                dispatch(addAgentBet(agentBet));

                const potentialWinnings = bet.stake * bet.odds;
                const taxAmount = calculateTaxAmount(potentialWinnings);
                const netWinnings = calculateNetWinnings(potentialWinnings);
                const taxInfo = `\nTax: ${(TAX_RATE * 100).toFixed(0)}% (SSP ${taxAmount.toFixed(2)})
                  Net Winnings: SSP ${netWinnings.toFixed(2)}`;

                alert(`🎯 SUCCESSFULLY PLACED SINGLE BET FOR AGENT USER! 🎯

                  User: ${selectedUser.phone_number}
                  Game: ${bet.homeTeam} vs ${bet.awayTeam}
                  Market: ${bet.betType} | Outcome: ${bet.selection}
                  Stake: SSP ${bet.stake.toFixed(2)}
                  Odds: ${bet.odds}
                  Potential Winnings: SSP ${potentialWinnings.toFixed(2)}${taxInfo}`);
              } catch (error: any) {
                console.error(`Failed to place bet:`, error);
                throw new Error(`Failed to place bet: ${error.message}`);
              }
            }
          }
        }

        // Clear betslip after successful placement
        dispatch(clearBetSlip());
      } else {
        // Regular user mode
        if (!user || !user.id) {
          alert("User not authenticated. Please log in again.");
          return;
        }

        const result = await placeBets(
          betSlipItems,
          betSlipItems.length > 1, // Automatically use multibet for multiple selections
          multibetStake,
          user.id,
          user.bettingLimits
        );

        if (Array.isArray(result)) {
          // Single bets
          const betDetails = result
            .map((bet, index) => {
              const selection = betSlipItems[index];
              return `\n${index + 1}. ${selection?.homeTeam} vs ${selection?.awayTeam}
                  Market: ${selection?.betType} | Outcome: ${selection?.selection}
                  Odds: ${selection?.odds || 0} | Stake: SSP ${selection?.stake || 0}
                  Potential Winnings: SSP ${((selection?.stake || 0) * (selection?.odds || 1)).toFixed(2)}
                  Bet ID: ${bet.betId} | Status: ${bet.status}`;
            })
            .join("\n");

          const totalStake = betSlipItems.reduce(
            (sum, bet) => sum + bet.stake,
            0
          );
          const totalPotentialWinnings = betSlipItems.reduce(
            (sum, bet) => sum + bet.stake * bet.odds,
            0
          );

          const taxAmount = calculateTaxAmount(totalPotentialWinnings);
          const netWinnings = calculateNetWinnings(totalPotentialWinnings);
          const taxInfo = `\n\nTax: ${(TAX_RATE * 100).toFixed(0)}% (SSP ${taxAmount.toFixed(2)})
Net Winnings: SSP ${netWinnings.toFixed(2)}`;

          alert(`🎉 SUCCESSFULLY PLACED ${result.length} SINGLE BETS! 🎉

Total Stake: SSP ${totalStake.toFixed(2)}
Total Potential Winnings: SSP ${totalPotentialWinnings.toFixed(2)}${taxInfo}

Bet Details:${betDetails}`);

          result.forEach((bet) => {
            console.log("Bet ID:", bet.betId, "Status:", bet.status);
          });
        } else {
          // Multibet
          const combinedOdds = calculateCombinedOdds(betSlipItems);
          const potentialWinnings = multibetStake * combinedOdds;

          const selections = betSlipItems
            .map(
              (bet, index) =>
                `${index + 1}. ${bet.homeTeam} vs ${bet.awayTeam} (${bet.betType}: ${bet.selection}) @ ${bet.odds}`
            )
            .join("\n");

          const taxAmount = calculateTaxAmount(potentialWinnings);
          const netWinnings = calculateNetWinnings(potentialWinnings);
          const taxInfo = `\nTax: ${(TAX_RATE * 100).toFixed(0)}% (SSP ${taxAmount.toFixed(2)})
Net Winnings: SSP ${netWinnings.toFixed(2)}`;

          alert(`🎯 SUCCESSFULLY PLACED MULTIBET! 🎯

Bet ID: ${result.betId}
Status: ${result.status}
Stake: SSP ${multibetStake.toFixed(2)}
Combined Odds: ${combinedOdds.toFixed(2)}
Potential Winnings: SSP ${potentialWinnings.toFixed(2)}${taxInfo}

Selections:
${selections}`);

          console.log("Multibet ID:", result.betId, "Status:", result.status);
        }

        // Clear betslip after successful placement
        dispatch(clearBetSlip());
      }
    } catch (error: any) {
      console.error("Failed to place bets:", error.message);
      alert(`Failed to place bets: ${error.message}`);
    } finally {
      setIsPlacingBets(false);
    }
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

      {/* Bet Slip Modal */}
      {isBetSlipVisible && (
        <div
          className="betslip-modal-overlay"
          onClick={() => dispatch(hideBetSlip())}
        >
          <div
            className="betslip-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="betslip-modal-header">
              <h3>📋 Bet Slip ({betSlipItems.length} bets)</h3>
              {isAgentMode && selectedUser && (
                <div className="agent-bet-info">
                  <span className="agent-bet-label">Placing bets for:</span>
                  <span className="agent-bet-user">
                    {selectedUser.phone_number}
                  </span>
                </div>
              )}
              <button
                className="betslip-modal-close"
                onClick={() => dispatch(hideBetSlip())}
              >
                ✕
              </button>
            </div>

            <div className="betslip-modal-body">
              {betSlipItems.length === 0 ? (
                <div className="empty-betslip">
                  <p>
                    No bets added yet. Click on odds to add them to your slip.
                  </p>
                </div>
              ) : (
                <>
                  {/* Bet Mode Toggle - Only show when single selection */}
                  {betSlipItems.length === 1 && (
                    <div className="bet-mode-toggle">
                      <button
                        className={`mode-btn ${
                          !isMultibetMode ? "active" : ""
                        }`}
                        onClick={() => dispatch(toggleMultibetMode())}
                      >
                        Single Bets
                      </button>
                      <button
                        className={`mode-btn ${isMultibetMode ? "active" : ""}`}
                        onClick={() => dispatch(toggleMultibetMode())}
                      >
                        Multibet
                      </button>
                    </div>
                  )}

                  {/* Auto-enable multibet for multiple selections */}
                  {betSlipItems.length > 1 && !isMultibetMode && (
                    <div className="auto-multibet-notice">
                      <p>
                        🔄 Multiple selections detected - automatically
                        switching to multibet mode
                      </p>
                    </div>
                  )}

                  {/* Multibet Info - Show automatically for multiple selections */}
                  {(betSlipItems.length > 1 || isMultibetMode) &&
                    betSlipItems.length >= 2 && (
                      <div className="multibet-info">
                        <div className="multibet-stats">
                          <div className="stat-item">
                            <span className="stat-label">Combined Odds:</span>
                            <span className="stat-value">
                              {calculateCombinedOdds(betSlipItems).toFixed(2)}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">
                              Potential Winnings:
                            </span>
                            <span className="stat-value">
                              $
                              {calculateMultibetWinnings(
                                betSlipItems,
                                multibetStake
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="multibet-stake-input">
                          <label htmlFor="multibetStake">
                            Stake ({user?.currency || "SSP"})
                            {user?.bettingLimits && (
                              <span className="stake-limits">
                                Min: {user.currency}{" "}
                                {user.bettingLimits.minStake.toFixed(2)} | Max:{" "}
                                {user.currency}{" "}
                                {user.bettingLimits.maxStake.toFixed(2)}
                              </span>
                            )}
                          </label>
                          <input
                            type="number"
                            id="multibetStake"
                            value={multibetStake}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (user?.bettingLimits) {
                                const { minStake, maxStake } =
                                  user.bettingLimits;
                                if (value >= minStake && value <= maxStake) {
                                  dispatch(setMultibetStake(value));
                                }
                              } else {
                                dispatch(setMultibetStake(value));
                              }
                            }}
                            min={user?.bettingLimits?.minStake || 1}
                            max={user?.bettingLimits?.maxStake || 1000}
                            step="0.01"
                            className="stake-input"
                            placeholder={`${user?.bettingLimits?.minStake || 1} - ${user?.bettingLimits?.maxStake || 1000}`}
                          />
                        </div>
                      </div>
                    )}

                  {/* Enhanced Validation Message - Show for all bet types */}
                  {betSlipItems.length > 0 && (
                    <div className="validation-message">
                      {(() => {
                        const isMultibet =
                          betSlipItems.length > 1 || isMultibetMode;
                        const stake = isMultibet
                          ? multibetStake
                          : betSlipItems[0]?.stake || 0;
                        const validation = validateBetslipWithLimits(
                          betSlipItems,
                          isMultibet,
                          stake
                        );

                        return validation.isValid ? (
                          <div className="valid-message">
                            ✅ Valid bet selections
                          </div>
                        ) : (
                          <div className="invalid-message">
                            ❌ {validation.error}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div className="betslip-items">
                    {betSlipItems.map((bet) => (
                      <div key={bet.id} className="betslip-item">
                        <div className="betslip-game">
                          <div className="betslip-teams">
                            {bet.homeTeam} vs {bet.awayTeam}
                          </div>
                          <div className="betslip-selection">
                            {bet.betType}: {bet.selection} @ {bet.odds}
                          </div>
                        </div>
                        {betSlipItems.length === 1 && !isMultibetMode && (
                          <div className="betslip-stake">
                            <input
                              type="number"
                              value={bet.stake}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (user?.bettingLimits) {
                                  const { minStake, maxStake } =
                                    user.bettingLimits;
                                  if (value >= minStake && value <= maxStake) {
                                    dispatch(
                                      updateBetSlipStake({
                                        id: bet.id,
                                        stake: value,
                                      })
                                    );
                                  }
                                } else {
                                  dispatch(
                                    updateBetSlipStake({
                                      id: bet.id,
                                      stake: value,
                                    })
                                  );
                                }
                              }}
                              min={user?.bettingLimits?.minStake || 1}
                              max={user?.bettingLimits?.maxStake || 1000}
                              step="0.01"
                              className="stake-input"
                              placeholder={`${user?.bettingLimits?.minStake || 1} - ${user?.bettingLimits?.maxStake || 1000}`}
                            />
                          </div>
                        )}
                        {betSlipItems.length === 1 && !isMultibetMode && (
                          <div className="betslip-winnings">
                            ${bet.potentialWinnings.toFixed(2)}
                          </div>
                        )}
                        <button
                          className="remove-bet-btn"
                          onClick={() => dispatch(removeFromBetSlip(bet.id))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="betslip-footer">
                    {/* Use BetSlipSummary component for consistent tax display */}
                    {betSlipItems.length > 0 && (
                      <>
                        {/* Debug info */}
                        {process.env["NODE_ENV"] === "development" && (
                          <div
                            style={{
                              background: "#f0f0f0",
                              padding: "10px",
                              margin: "10px 0",
                              fontSize: "12px",
                            }}
                          >
                            <strong>Debug Info:</strong>
                            <br />
                            betSlipData:{" "}
                            {betSlipData ? "Available" : "Not Available"}
                            <br />
                            User Currency: {user?.currency}
                            <br />
                            betSlipItems length: {betSlipItems.length}
                            <br />
                            multibetStake: {multibetStake}
                          </div>
                        )}
                        <BetSlipSummary
                          slip={
                            betSlipData || {
                              id: "temp-slip",
                              userId: user?.id || "",
                              selections: betSlipItems.map((bet) => ({
                                gameId: bet.gameId,
                                homeTeam: bet.homeTeam,
                                awayTeam: bet.awayTeam,
                                marketType: bet.betType,
                                outcome: bet.selection,
                                odds: {
                                  decimal: bet.odds,
                                  american: 0,
                                  multiplier: 0,
                                },
                                bookmaker: bet.bookmaker,
                                gameTime: bet.gameTime,
                                sportKey: bet.sportKey,
                              })),
                              stake:
                                betSlipItems.length > 1
                                  ? multibetStake
                                  : betSlipItems[0]?.stake || 0,
                              potentialWinnings:
                                betSlipItems.length > 1
                                  ? calculateMultibetWinnings(
                                      betSlipItems,
                                      multibetStake
                                    )
                                  : (betSlipItems[0]?.stake || 0) *
                                    (betSlipItems[0]?.odds || 1),
                              taxPercentage: 0, // No tax in fallback
                              taxAmount: 0, // No tax in fallback
                              netWinnings: (() => {
                                // Calculate net winnings safely
                                const stake =
                                  betSlipItems.length > 1
                                    ? multibetStake
                                    : betSlipItems[0]?.stake || 0;
                                const odds =
                                  betSlipItems.length > 1
                                    ? calculateCombinedOdds(betSlipItems)
                                    : betSlipItems[0]?.odds || 1;
                                const potentialWinnings = stake * odds;
                                return potentialWinnings;
                              })(),
                              odds: {
                                decimal: calculateCombinedOdds(betSlipItems),
                                american: 0,
                                multiplier: 0,
                              },
                              createdAt: new Date().toISOString(),
                              expiresAt: new Date(
                                Date.now() + 24 * 60 * 60 * 1000
                              ).toISOString(),
                            }
                          }
                          currency={user?.currency || "USD"}
                          isMultibet={betSlipItems.length > 1}
                          isLoading={!betSlipData}
                          betSlipResponse={
                            betSlipData
                              ? {
                                  success: true,
                                  message: "",
                                  data: betSlipData,
                                }
                              : undefined
                          }
                        />
                      </>
                    )}

                    <button
                      className="btn btn-primary place-bets-btn"
                      onClick={handlePlaceBets}
                      disabled={
                        isPlacingBets ||
                        (() => {
                          const isMultibet =
                            betSlipItems.length > 1 || isMultibetMode;
                          const stake = isMultibet
                            ? multibetStake
                            : betSlipItems[0]?.stake || 0;
                          const validation = validateBetslipWithLimits(
                            betSlipItems,
                            isMultibet,
                            stake
                          );
                          return !validation.isValid;
                        })()
                      }
                    >
                      {isPlacingBets
                        ? "Placing Bets..."
                        : betSlipItems.length > 1
                          ? "Place Multibet"
                          : "Place Bet"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
