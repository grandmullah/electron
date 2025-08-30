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
import ShopService, { Shop } from "../../services/shopService";
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
  const [availableShops, setAvailableShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [shopError, setShopError] = useState<string>("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    country_code: "KE", // Default to US
    role: "user" as "user" | "agent" | "admin",
    currency: "SSP", // Default to USD
    shop_code: "",
  });

  // Fetch available shops on component mount
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await ShopService.getActiveShops();
        console.log("Shop response:", response);
        if (response.success && (response.data || response.shops)) {
          const shops = response.data || response.shops || [];
          console.log("Available shops:", shops);
          setAvailableShops(shops);
          // Set default shop if available
          if (shops.length > 0) {
            const defaultShop =
              shops.find((shop) => shop.shop_code === "MAIN001") || shops[0];
            if (defaultShop) {
              setSelectedShop(defaultShop.shop_code);
              setFormData((prev) => ({
                ...prev,
                shop_code: defaultShop.shop_code,
                currency: defaultShop.default_currency || "USD",
              }));
            }
          }
        } else {
          console.error("Failed to fetch shops:", response);
          setShopError("Failed to load shops. Please try again.");
        }
      } catch (error) {
        console.error("Failed to fetch shops:", error);
        setShopError("Failed to load shops. Please try again.");
      }
    };

    fetchShops();
  }, []);

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

  const handleShopChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const shopCode = e.target.value;
    setSelectedShop(shopCode);
    const selectedShopData = availableShops.find(
      (shop) => shop.shop_code === shopCode
    );
    if (selectedShopData) {
      setFormData((prev) => ({
        ...prev,
        shop_code: shopCode,
        currency: selectedShopData.default_currency || "USD",
      }));
    }
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

    if (!isLoginMode && !formData.shop_code) {
      dispatch(loginFailure("Please select a shop"));
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
          country_code: formData.country_code,
          role: formData.role,
          currency: formData.currency,
          shop_code: formData.shop_code || "",
        };

        console.log("Attempting registration with:", {
          phone_number: fullPhoneNumber,
          role: formData.role,
          currency: formData.currency,
          shop_code: formData.shop_code,
        });
        response = await AuthService.register(registerData);
        console.log("Registration successful:", response);
      }

      // Only proceed if we have a successful response
      if (response && response.user && response.token) {
        console.log("Response received:", response);
        console.log("User data:", response.user);

        try {
          const user = convertAuthUserToUser(response.user);
          console.log("Converted user:", user);

          dispatch(loginSuccess(user));

          // Show success message
          console.log(
            `${isLoginMode ? "Login" : "Registration"} successful! Welcome ${
              user.name
            }`
          );
        } catch (conversionError: any) {
          console.error("Error converting user data:", conversionError);
          console.error("Raw user data:", response.user);
          throw new Error(
            `User data conversion failed: ${conversionError.message}`
          );
        }

        // Clear form and close modal only after successful authentication
        setShowAuthForm(false);
        setPhoneNumber("");
        setSelectedCountry("US");
        setFormData({
          password: "",
          confirmPassword: "",
          country_code: "US", // Reset to US
          role: "user",
          currency: "USD", // Reset to USD
          shop_code: "",
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
                  {user.currency} {user.balance.toFixed(2)}
                </span>
              </div>
              <div className="user-role">
                <span className="role-badge">{user.role}</span>
              </div>
              {user.shop && (
                <div className="user-shop">
                  <span className="shop-label">Shop:</span>
                  <span className="shop-name">{user.shop.shop_name}</span>
                </div>
              )}
              <div className="user-betting-limits">
                <span className="limits-label">Betting Limits:</span>
                <div className="limits-details">
                  <div className="limit-item">
                    <span className="limit-label">Stake Range:</span>
                    <span className="limit-value">
                      {user.currency}{" "}
                      {user.bettingLimits.minStake.toLocaleString()} -{" "}
                      {user.currency}{" "}
                      {user.bettingLimits.maxStake.toLocaleString()}
                    </span>
                  </div>
                  <div className="limit-item">
                    <span className="limit-label">Daily Loss Limit:</span>
                    <span className="limit-value">
                      {user.currency}{" "}
                      {user.bettingLimits.maxDailyLoss.toLocaleString()}
                    </span>
                  </div>
                  <div className="limit-item">
                    <span className="limit-label">Weekly Loss Limit:</span>
                    <span className="limit-value">
                      {user.currency}{" "}
                      {user.bettingLimits.maxWeeklyLoss.toLocaleString()}
                    </span>
                  </div>
                </div>
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
                        <label htmlFor="shopSelect">Shop</label>
                        {shopError && (
                          <div
                            className="error-message"
                            style={{ marginBottom: "0.5rem" }}
                          >
                            <div className="error-icon">⚠️</div>
                            <div className="error-content">
                              <p>{shopError}</p>
                            </div>
                          </div>
                        )}
                        <select
                          id="shopSelect"
                          value={selectedShop}
                          onChange={handleShopChange}
                          className="form-input"
                          required
                        >
                          <option value="">Select a shop</option>
                          {availableShops.map((shop) => (
                            <option key={shop.id} value={shop.shop_code}>
                              {shop.shop_name} ({shop.shop_code})
                            </option>
                          ))}
                        </select>
                        {availableShops.length === 0 && !shopError && (
                          <div
                            className="loading-shops"
                            style={{
                              marginTop: "0.5rem",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Loading shops...
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="country_code">Country Code</label>
                        <select
                          id="country_code"
                          name="country_code"
                          value={formData.country_code}
                          onChange={handleInputChange}
                          className="form-input"
                          required
                        >
                          <option value="US">US - United States</option>
                          <option value="KE">KE - Kenya</option>
                          <option value="SS">SS - South Sudan</option>
                          <option value="GB">GB - United Kingdom</option>
                          <option value="DE">DE - Germany</option>
                          <option value="FR">FR - France</option>
                          <option value="CA">CA - Canada</option>
                          <option value="AU">AU - Australia</option>
                          <option value="NG">NG - Nigeria</option>
                          <option value="ZA">ZA - South Africa</option>
                        </select>
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
                          <option value="USD">
                            ★ USD - US Dollars (System Default)
                          </option>
                          <option value="SSP">SSP - South Sudan Pounds</option>
                          <option value="EUR">EUR - Euros</option>
                          <option value="GBP">GBP - British Pounds</option>
                          <option value="KES">KES - Kenyan Shillings</option>
                        </select>
                        <div
                          className="currency-info"
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.875rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          <p>
                            💡 <strong>Betting Limits:</strong> Min: $10 USD |
                            Max: $100,000 USD
                          </p>
                        </div>
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
      </div>
    </div>
  );
};
