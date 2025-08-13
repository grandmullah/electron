import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginSuccess, logout } from "../store/authSlice";
import { convertAuthUserToUser } from "../store/authSlice";
import AuthService from "../services/authService";

interface SessionExpirationWarningProps {
  warningMinutes?: number; // How many minutes before expiration to show warning
  checkInterval?: number; // How often to check in seconds
}

export const SessionExpirationWarning: React.FC<
  SessionExpirationWarningProps
> = ({ warningMinutes = 5, checkInterval = 30 }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkTokenExpiration = () => {
      // Check if token is expired
      if (AuthService.isTokenExpired()) {
        console.log("Token has expired, logging out user");
        dispatch(logout());
        AuthService.logout();
        setShowWarning(false);
        return;
      }

      // Check if token is expiring soon
      if (AuthService.isTokenExpiring(warningMinutes)) {
        const expiration = AuthService.getTokenExpiration();
        if (expiration) {
          const remaining = Math.max(0, expiration - Date.now());
          setTimeRemaining(remaining);
          setShowWarning(true);
        }
      } else {
        setShowWarning(false);
      }
    };

    // Initial check
    checkTokenExpiration();

    // Set up interval to check periodically
    const interval = setInterval(checkTokenExpiration, checkInterval * 1000);

    return () => clearInterval(interval);
  }, [user, warningMinutes, checkInterval, dispatch]);

  const handleExtendSession = async () => {
    setIsRefreshing(true);
    try {
      const response = await AuthService.refreshToken();
      const updatedUser = convertAuthUserToUser(response.user);
      dispatch(loginSuccess(updatedUser));
      setShowWarning(false);
      console.log("Session extended successfully");
    } catch (error: any) {
      console.error("Failed to extend session:", error);
      // If refresh fails, user will be logged out automatically by AuthService
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    AuthService.logout();
    setShowWarning(false);
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (!showWarning || !user) return null;

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <div className="session-warning-header">
          <div className="warning-icon">⏰</div>
          <h3>Session Expiring Soon</h3>
        </div>

        <div className="session-warning-body">
          <p>Your session will expire in:</p>
          <div className="time-remaining">
            {formatTimeRemaining(timeRemaining)}
          </div>
          <p>Would you like to continue your session?</p>
        </div>

        <div className="session-warning-actions">
          <button
            className="btn btn-outline"
            onClick={handleLogout}
            disabled={isRefreshing}
          >
            Logout
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExtendSession}
            disabled={isRefreshing}
          >
            {isRefreshing && <span className="spinner-small"></span>}
            {isRefreshing ? "Extending..." : "Continue Session"}
          </button>
        </div>
      </div>
    </div>
  );
};
