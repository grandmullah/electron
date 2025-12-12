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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  InputAdornment,
  Container,
  Paper,
  Stack,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  SportsEsports as GamesIcon,
  Person as AgentIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon,
  Store as ShopIcon,
  Security as LimitsIcon,
} from "@mui/icons-material";

type CountryCode = string;

interface HomePageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const isAgentRole =
    user?.role === "agent" || user?.role === "super_agent";

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("SS");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [availableShops, setAvailableShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [shopError, setShopError] = useState<string>("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    country_code: "SS", // Default to South Sudan
    role: "user" as "user" | "agent" | "admin",
    currency: "SSP", // Default to SSP
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
              shops.find((shop) => shop.shop_code === "jebel") || shops[0]; // Prefer jebel shop
            if (defaultShop) {
              setSelectedShop(defaultShop.shop_code);
              setFormData((prev) => ({
                ...prev,
                shop_code: defaultShop.shop_code,
                currency: "SSP", // Always use SSP currency
              }));
              console.log("Default shop set:", defaultShop.shop_code);
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
        currency: "SSP", // Always use SSP currency
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
        
        // Enforce agent-only login
        if (response && response.user && response.user.role !== 'agent') {
          dispatch(loginFailure("This application is for agents only. Please contact your administrator."));
          AuthService.logout();
          return;
        }
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
          selectedShop: selectedShop,
          availableShops: availableShops.map((s) => s.shop_code),
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
        setSelectedCountry("SS");
        setFormData({
          password: "",
          confirmPassword: "",
          country_code: "SS", // Reset to South Sudan
          role: "user",
          currency: "SSP", // Reset to SSP
          shop_code: selectedShop, // Keep the selected shop
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
    <Box
      sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        minHeight: "100vh",
        color: "#ffffff",
      }}
    >
      <Header onNavigate={onNavigate} currentPage="home" />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {user ? (
          // Logged in user view
          <Stack spacing={4} alignItems="center">
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                textAlign: "center",
                width: "100%",
                maxWidth: 800,
              }}
            >
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                🚀 Welcome back, {user.name}!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {isAgentRole 
                  ? "Agent Dashboard - Manage Walk-in Clients"
                  : "Your Ultimate Betting Experience"}
              </Typography>
              {isAgentRole && (
                <Chip
                  label={user.role === "super_agent" ? "Super Agent Account" : "Agent Account"}
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    mb: 3,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  }}
                />
              )}

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  mb: 4,
                  justifyContent: "center",
                }}
              >
                {/* Shop Card */}
                {user.shop && (
                  <Box sx={{ flex: "1 1 250px", maxWidth: 300 }}>
                    <Card
                      elevation={2}
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      <CardContent>
                        <ShopIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" fontWeight="bold">
                          Shop
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {user.shop.shop_name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {/* Betting Limits Card */}
                <Box sx={{ flex: "1 1 250px", maxWidth: 300 }}>
                  <Card
                    elevation={2}
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      textAlign: "center",
                    }}
                  >
                    <CardContent>
                      <LimitsIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Betting Limits
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Stake:</strong> {user.currency}{" "}
                          {user.bettingLimits.minStake.toLocaleString()} -{" "}
                          {user.currency}{" "}
                          {user.bettingLimits.maxStake.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Daily Loss:</strong> {user.currency}{" "}
                          {user.bettingLimits.maxDailyLoss.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Weekly Loss:</strong> {user.currency}{" "}
                          {user.bettingLimits.maxWeeklyLoss.toLocaleString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<GamesIcon />}
                  onClick={() => onNavigate("games")}
                  sx={{
                    px: 3,
                    py: 1.5,
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)",
                    },
                  }}
                >
                  View Games
                </Button>
                {isAgentRole && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AgentIcon />}
                    onClick={() => onNavigate("agent")}
                    sx={{
                      px: 3,
                      py: 1.5,
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)",
                      },
                    }}
                  >
                    Agent Dashboard
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    },
                  }}
                >
                  Logout
                </Button>
              </Stack>
            </Paper>
          </Stack>
        ) : (
          // Guest user view
          <Stack spacing={4} alignItems="center">
            <Paper
              elevation={3}
              sx={{
                p: 6,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                textAlign: "center",
                width: "100%",
                maxWidth: 600,
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                🚀 Welcome to Betzone
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 2, color: "rgba(255, 255, 255, 0.7)" }}
              >
                Agent Portal for Walk-in Betting
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 4, color: "rgba(255, 255, 255, 0.6)" }}
              >
                This application is for authorized agents only
              </Typography>

              <Stack
                direction="row"
                spacing={3}
                justifyContent="center"
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={() => setShowAuthForm(true)}
                  sx={{
                    px: 4,
                    py: 2,
                    fontSize: "1.1rem",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)",
                    },
                  }}
                >
                  Agent Login
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<GamesIcon />}
                  onClick={() => onNavigate("games")}
                  sx={{
                    px: 4,
                    py: 2,
                    fontSize: "1.1rem",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    },
                  }}
                >
                  View Games (Guest)
                </Button>
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* MUI Authentication Modal */}
        <Dialog
          open={showAuthForm}
          onClose={() => setShowAuthForm(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
              color: "white",
              backgroundImage: "none",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
            },
          }}
          sx={{
            "& .MuiBackdrop-root": {
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              backdropFilter: "blur(5px)",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 2,
              background: "transparent",
              color: "white",
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="white">
              {isLoginMode ? "Login" : "Register"}
            </Typography>
            <IconButton
              onClick={() => setShowAuthForm(false)}
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              pt: 1,
              background: "transparent",
              color: "white",
            }}
          >
            {error && (
              <Alert
                severity="error"
                onClose={() => dispatch(clearError())}
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                mt: 2,
                "& .MuiTextField-root": {
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976d2",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                    "&.Mui-focused": {
                      color: "#1976d2",
                    },
                  },
                },
                "& .MuiFormControl-root": {
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                    "&.Mui-focused": {
                      color: "#1976d2",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976d2",
                    },
                  },
                  "& .MuiSelect-icon": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                },
              }}
              id="auth-form"
            >
              <FormControl fullWidth margin="normal">
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountry}
                  onChange={(e) =>
                    setSelectedCountry(e.target.value as CountryCode)
                  }
                  disabled={isLoading}
                  label="Country"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#2d3748",
                        color: "white",
                        "& .MuiMenuItem-root": {
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "rgba(25, 118, 210, 0.3)",
                            "&:hover": {
                              backgroundColor: "rgba(25, 118, 210, 0.4)",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {getCountries().map((country) => (
                    <MenuItem key={country} value={country}>
                      {getCountryFlag(country)} {country} (+
                      {getCountryCallingCode(country)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                margin="normal"
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter your phone number"
                disabled={isLoading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <span>{getCountryFlag(selectedCountry)}</span>
                        <span>
                          +{getCountryCallingCode(selectedCountry as any)}
                        </span>
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  handleInputChange(e as React.ChangeEvent<HTMLInputElement>)
                }
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              {!isLoginMode && (
                <>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange(
                        e as React.ChangeEvent<HTMLInputElement>
                      )
                    }
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                  {shopError && (
                    <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
                      {shopError}
                    </Alert>
                  )}
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Shop</InputLabel>
                    <Select
                      value={selectedShop}
                      onChange={(e) => {
                        const event = {
                          target: { value: e.target.value },
                        } as React.ChangeEvent<HTMLSelectElement>;
                        handleShopChange(event);
                      }}
                      label="Shop"
                      disabled={isLoading}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: "#2d3748",
                            color: "white",
                            "& .MuiMenuItem-root": {
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "rgba(25, 118, 210, 0.3)",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.4)",
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select a shop</em>
                      </MenuItem>
                      {availableShops.map((shop) => (
                        <MenuItem key={shop.id} value={shop.shop_code}>
                          {shop.shop_name} ({shop.shop_code})
                        </MenuItem>
                      ))}
                    </Select>
                    {availableShops.length === 0 && !shopError && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Loading shops...
                      </Typography>
                    )}
                  </FormControl>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Country Code</InputLabel>
                    <Select
                      name="country_code"
                      value={formData.country_code}
                      onChange={(e) =>
                        handleInputChange({
                          target: {
                            name: "country_code",
                            value: e.target.value,
                          },
                        } as React.ChangeEvent<HTMLSelectElement>)
                      }
                      label="Country Code"
                      disabled={isLoading}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: "#2d3748",
                            color: "white",
                            "& .MuiMenuItem-root": {
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "rgba(25, 118, 210, 0.3)",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.4)",
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="SS">SS - South Sudan</MenuItem>
                      <MenuItem value="US">US - United States</MenuItem>
                      <MenuItem value="KE">KE - Kenya</MenuItem>
                      <MenuItem value="GB">GB - United Kingdom</MenuItem>
                      <MenuItem value="DE">DE - Germany</MenuItem>
                      <MenuItem value="FR">FR - France</MenuItem>
                      <MenuItem value="CA">CA - Canada</MenuItem>
                      <MenuItem value="AU">AU - Australia</MenuItem>
                      <MenuItem value="NG">NG - Nigeria</MenuItem>
                      <MenuItem value="ZA">ZA - South Africa</MenuItem>
                    </Select>
                  </FormControl>
                  {/* <div className="form-group">
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
                      </div> */}
                  {/* <div className="form-group">
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
                            💡 <strong>Betting Limits:</strong> Min: SSP 10 |
                            Max: SSP 100,000
                          </p>
                        </div>
                      </div> */}
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              pb: 3,
              gap: 2,
              background: "transparent",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{ flex: 1 }}
              form="auth-form"
            >
              {isLoading
                ? `${isLoginMode ? "Logging in" : "Registering"}...`
                : isLoginMode
                  ? "Login"
                  : "Register"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsLoginMode(!isLoginMode)}
              disabled={isLoading}
              sx={{ flex: 1 }}
            >
              {isLoginMode
                ? "Need an account? Register"
                : "Have an account? Login"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};
