import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
  logout,
} from "../../store/authSlice";
import AuthService, {
  RegisterRequest,
  LoginRequest,
} from "../../services/authService";
import { convertAuthUserToUser } from "../../store/authSlice";
import { getCountryCallingCode, getCountries } from "react-phone-number-input";

type CountryCode = string;

interface HomePageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("KE");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    role: "user" as "user" | "agent" | "admin",
    currency: "USD",
  });

  useEffect(() => {
    const handleFocus = () => {
      if (!user && !isLoading) {
        setShowAuthForm(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    handleFocus(); // Initial check

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, isLoading]);

  useEffect(() => {
    // Show auth modal immediately if no user is logged in
    if (!user && !isLoading) {
      console.log("No user logged in, showing auth modal");
      setShowAuthForm(true);
    } else {
      console.log("User state:", { user: !!user, isLoading, showAuthForm });
    }
  }, [user, isLoading]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    // Validation
    if (!phoneNumber || phoneNumber.length < 7) {
      dispatch(loginFailure("Please enter a valid phone number"));
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      dispatch(loginFailure("Password must be at least 6 characters"));
      return;
    }

    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      dispatch(loginFailure("Passwords do not match"));
      return;
    }

    try {
      dispatch(loginStart());

      // Build full phone number with country code
      const fullPhoneNumber = `+${getCountryCallingCode(
        selectedCountry as any
      )}${phoneNumber}`;

      let response;

      if (isLoginMode) {
        const loginData: LoginRequest = {
          phone_number: fullPhoneNumber,
          password: formData.password,
        };

        console.log("Attempting login with:", {
          phone_number: fullPhoneNumber,
        });
        response = await AuthService.login(loginData);
        console.log("Login successful:", response);
      } else {
        const registerData: RegisterRequest = {
          phone_number: fullPhoneNumber,
          password: formData.password,
          role: formData.role,
          currency: formData.currency,
        };

        console.log("Attempting registration with:", {
          phone_number: fullPhoneNumber,
          role: formData.role,
          currency: formData.currency,
        });
        response = await AuthService.register(registerData);
        console.log("Registration successful:", response);
      }

      // Only proceed if we have a successful response
      if (response && response.user && response.token) {
        const user = convertAuthUserToUser(response.user);
        dispatch(loginSuccess(user));

        // Show success message
        console.log(
          `${isLoginMode ? "Login" : "Registration"} successful! Welcome ${
            user.name
          }`
        );

        // Clear form and close modal only after successful authentication
        setShowAuthForm(false);
        setPhoneNumber("");
        setSelectedCountry("US");
        setFormData({
          password: "",
          confirmPassword: "",
          role: "user",
          currency: "USD",
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error(`${isLoginMode ? "Login" : "Registration"} error:`, error);

      // Extract meaningful error message
      let errorMessage =
        error.message || `${isLoginMode ? "Login" : "Registration"} failed`;

      // Handle common error cases
      if (
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        errorMessage = "Invalid phone number or password";
      } else if (
        error.message?.includes("409") ||
        error.message?.includes("already exists")
      ) {
        errorMessage = "An account with this phone number already exists";
      } else if (
        error.message?.includes("400") ||
        error.message?.includes("Bad Request")
      ) {
        errorMessage = "Please check your information and try again";
      } else if (
        error.message?.includes("500") ||
        error.message?.includes("Server Error")
      ) {
        errorMessage = "Server error. Please try again later";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("fetch") ||
        error.message?.includes("Unable to connect to server")
      ) {
        errorMessage = error.message.includes("backend server")
          ? error.message
          : "Network error. Please check your connection";
      }

      dispatch(loginFailure(errorMessage));
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    dispatch(logout());
  };

  return (
    <div>
      <Header onNavigate={onNavigate} currentPage="home" />

      <div className="home-content">
        {user ? (
          // Logged in user view
          <div className="hero-section">
            <h1 className="hero-title">🚀 Welcome back, {user.name}!</h1>
            <p className="hero-subtitle">Your Ultimate Betting Experience</p>
            <div className="user-info">
              <div className="user-balance">
                <span className="balance-label">Balance:</span>
                <span className="balance-amount">
                  ${user.balance.toFixed(2)} {user.currency}
                </span>
              </div>
              <div className="user-role">
                <span className="role-badge">{user.role}</span>
              </div>
            </div>
            <div className="hero-buttons">
              <button
                className="btn btn-primary"
                onClick={() => onNavigate("games")}
              >
                🎮 View Games
              </button>
              {user.role === "agent" && (
                <button
                  className="btn btn-secondary"
                  onClick={() => onNavigate("agent")}
                >
                  👤 Agent Dashboard
                </button>
              )}
              <button className="btn btn-outline" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        ) : (
          // Guest user view
          <div className="hero-section">
            <h1 className="hero-title">🚀 Welcome to BetZone</h1>
            <p className="hero-subtitle">Your Ultimate Betting Experience</p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary"
                onClick={() => setShowAuthForm(true)}
              >
                🔐 Login / Register
              </button>
              <button
                className="btn btn-outline"
                onClick={() => onNavigate("games")}
              >
                🎮 View Games (Guest)
              </button>
            </div>
          </div>
        )}

        {/* Authentication Modal */}
        {showAuthForm && (
          <div className="modal-overlay" onClick={() => setShowAuthForm(false)}>
            <div
              className="modal-content auth-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{isLoginMode ? "Login" : "Register"}</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowAuthForm(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                {error && (
                  <div className="error-message">
                    <div className="error-icon">⚠️</div>
                    <div className="error-content">
                      <strong>Error:</strong>
                      <p>{error}</p>
                    </div>
                    <button
                      className="error-close"
                      onClick={() => dispatch(clearError())}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="countrySelect">Country</label>
                    <select
                      id="countrySelect"
                      value={selectedCountry}
                      onChange={(e) =>
                        setSelectedCountry(e.target.value as CountryCode)
                      }
                      className="form-input country-select"
                      disabled={isLoading}
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
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                      className="form-input"
                    />
                  </div>
                  {!isLoginMode && (
                    <>
                      <div className="form-group">
                        <label htmlFor="confirmPassword">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your password"
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="form-input"
                        >
                          <option value="user">User</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="currency">Currency</label>
                        <select
                          id="currency"
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          className="form-input"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="KES">KES</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading && <span className="spinner-small"></span>}
                      {isLoading
                        ? `${isLoginMode ? "Logging in" : "Registering"}...`
                        : isLoginMode
                        ? "Login"
                        : "Register"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setIsLoginMode(!isLoginMode)}
                    >
                      {isLoginMode
                        ? "Need an account? Register"
                        : "Have an account? Login"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Fast & Reliable</h3>
          <p>Lightning-fast performance with real-time updates</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure</h3>
          <p>Bank-level security for your betting activities</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Analytics</h3>
          <p>Advanced analytics and insights</p>
        </div>
      </div> */}
      </div>
    </div>
  );
};
