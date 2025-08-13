import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { loginSuccess, logout, User } from "../store/authSlice";
import {
  addToBetSlip,
  removeFromBetSlip,
  updateBetSlipStake,
  clearBetSlip,
  toggleBetSlipVisibility,
  hideBetSlip,
  toggleMultibetMode,
  setMultibetStake,
  BetSlipItem,
} from "../store/betslipSlice";
import { placeBets } from "../services/betslipService";
import { getCountryCallingCode, getCountries } from "react-phone-number-input";

type CountryCode = string;

interface HeaderProps {
  onNavigate: (page: "home" | "dashboard" | "settings" | "games") => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const {
    items: betSlipItems,
    isVisible: isBetSlipVisible,
    isMultibetMode,
    multibetStake,
  } = useAppSelector((state) => state.betslip);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("US");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, we'll just simulate success
      setOtpSent(true);
      setError("");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate API call to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, we'll accept any 6-digit OTP
      const fullPhoneNumber = `+${getCountryCallingCode(
        selectedCountry as any
      )}${phoneNumber}`;
      const newUser: User = {
        id: "1",
        name: `User ${phoneNumber.slice(-4)}`,
        phoneNumber: fullPhoneNumber,
        isLoggedIn: true,
      };

      dispatch(loginSuccess(newUser));
      setShowLoginModal(false);
      setPhoneNumber("");
      setOtp("");
      setOtpSent(false);
      setError("");
      setSelectedCountry("US");
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleResendOTP = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
  };

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
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

  const validateMultibet = (
    bets: BetSlipItem[]
  ): { isValid: boolean; error?: string } => {
    if (bets.length < 2) {
      return {
        isValid: false,
        error: "Multibet requires at least 2 selections",
      };
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
        return {
          isValid: false,
          error: `Conflicting selections for ${
            bets.find((b) => b.gameId === gameId)?.homeTeam
          } vs ${bets.find((b) => b.gameId === gameId)?.awayTeam}`,
        };
      }
    }

    return { isValid: true };
  };

  const [isPlacingBets, setIsPlacingBets] = useState(false);

  const handlePlaceBets = async () => {
    if (betSlipItems.length === 0) {
      alert("No bets in slip");
      return;
    }

    setIsPlacingBets(true);

    try {
      const result = await placeBets(
        betSlipItems,
        isMultibetMode,
        multibetStake
      );

      if (Array.isArray(result)) {
        // Single bets
        alert(`Successfully placed ${result.length} single bets!`);
        result.forEach((bet) => {
          console.log("Bet ID:", bet.betId, "Status:", bet.status);
        });
      } else {
        // Multibet
        alert(`Successfully placed multibet! Bet ID: ${result.betId}`);
        console.log("Multibet Status:", result.status);
      }

      // Clear betslip after successful placement
      dispatch(clearBetSlip());
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
          <h1 className="app-title">BetZone</h1>
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

          {user ? (
            <div className="user-section">
              <span className="user-name">Welcome, {user.name}</span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Login to BetZone</h2>
              <button
                className="modal-close"
                onClick={() => setShowLoginModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {!otpSent ? (
                <div className="login-step">
                  <h3>Enter Phone Number</h3>
                  <p>We'll send you a verification code</p>

                  <div className="form-group">
                    <label htmlFor="countrySelect">Country</label>
                    <select
                      id="countrySelect"
                      value={selectedCountry}
                      onChange={(e) =>
                        setSelectedCountry(e.target.value as CountryCode)
                      }
                      className="country-select"
                      disabled={loading}
                    >
                      {getCountries().map((country) => (
                        <option key={country} value={country}>
                          {getCountryFlag(country)} {country} (+
                          {getCountryCallingCode(country)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <div className="phone-input-container">
                      <div className="country-display">
                        <span className="country-flag">
                          {getCountryFlag(selectedCountry)}
                        </span>
                        <span className="country-code">
                          +{getCountryCallingCode(selectedCountry as any)}
                        </span>
                      </div>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter your phone number"
                        className="phone-number-input"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  <button
                    className="btn btn-primary btn-full"
                    onClick={handleSendOTP}
                    disabled={loading || !phoneNumber || phoneNumber.length < 7}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              ) : (
                <div className="login-step">
                  <h3>Enter Verification Code</h3>
                  <p>We've sent a 6-digit code to {phoneNumber}</p>

                  <div className="form-group">
                    <label htmlFor="otp">OTP Code</label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="Enter 6-digit code"
                      className="form-input"
                      maxLength={6}
                      disabled={loading}
                    />
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  <div className="otp-actions">
                    <button
                      className="btn btn-primary btn-full"
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <button
                      className="btn btn-outline btn-full"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  {/* Bet Mode Toggle */}
                  <div className="bet-mode-toggle">
                    <button
                      className={`mode-btn ${!isMultibetMode ? "active" : ""}`}
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

                  {/* Multibet Info */}
                  {isMultibetMode && betSlipItems.length >= 2 && (
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
                        <label htmlFor="multibetStake">Stake ($)</label>
                        <input
                          type="number"
                          id="multibetStake"
                          value={multibetStake}
                          onChange={(e) =>
                            dispatch(setMultibetStake(Number(e.target.value)))
                          }
                          min="1"
                          max="1000"
                          className="stake-input"
                        />
                      </div>
                    </div>
                  )}

                  {/* Validation Message */}
                  {isMultibetMode && betSlipItems.length > 0 && (
                    <div className="validation-message">
                      {(() => {
                        const validation = validateMultibet(betSlipItems);
                        return validation.isValid ? (
                          <div className="valid-message">
                            ✅ Valid multibet selections
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
                        {!isMultibetMode && (
                          <div className="betslip-stake">
                            <input
                              type="number"
                              value={bet.stake}
                              onChange={(e) =>
                                dispatch(
                                  updateBetSlipStake({
                                    id: bet.id,
                                    stake: Number(e.target.value),
                                  })
                                )
                              }
                              min="1"
                              max="1000"
                              className="stake-input"
                            />
                          </div>
                        )}
                        {!isMultibetMode && (
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
                    <div className="total-stake">
                      {isMultibetMode ? (
                        <>
                          <div>Stake: ${multibetStake.toFixed(2)}</div>
                          <div>
                            Combined Odds:{" "}
                            {calculateCombinedOdds(betSlipItems).toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <>
                          Total Stake: $
                          {betSlipItems
                            .reduce((sum, bet) => sum + bet.stake, 0)
                            .toFixed(2)}
                        </>
                      )}
                    </div>
                    <button
                      className="btn btn-primary place-bets-btn"
                      onClick={handlePlaceBets}
                      disabled={
                        isPlacingBets ||
                        (isMultibetMode &&
                          !validateMultibet(betSlipItems).isValid)
                      }
                    >
                      {isPlacingBets
                        ? "Placing Bets..."
                        : isMultibetMode
                        ? "Place Multibet"
                        : "Place Bets"}
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
