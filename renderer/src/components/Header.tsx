import React, { useState, useEffect } from "react";
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
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Stack,
  Chip,
  ListItemText,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const showUserDropdown = Boolean(anchorEl);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

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
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            py: { xs: 1.5, md: 2 },
            minHeight: { xs: 70, md: 80 },
          }}
        >
          {/* Left Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #1976d2, #42a5f5, #00d4ff)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontSize: { xs: "1.5rem", md: "1.75rem" },
                letterSpacing: "0.5px",
                textShadow: "0 0 30px rgba(25, 118, 210, 0.3)",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -4,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, #1976d2, #42a5f5, transparent)",
                  borderRadius: "2px",
                },
              }}
            >
              Betzone
            </Typography>

            {/* Navigation */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <Button
                onClick={() => onNavigate("home")}
                sx={{
                  color:
                    currentPage === "home"
                      ? "#42a5f5"
                      : "rgba(255, 255, 255, 0.7)",
                  bgcolor:
                    currentPage === "home"
                      ? "rgba(25, 118, 210, 0.15)"
                      : "transparent",
                  border:
                    currentPage === "home"
                      ? "1px solid rgba(25, 118, 210, 0.4)"
                      : "1px solid transparent",
                  borderRadius: "8px",
                  px: 2,
                  py: 0.75,
                  fontWeight: currentPage === "home" ? 600 : 500,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "white",
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                  },
                }}
              >
                Home
              </Button>
              <Button
                onClick={() => onNavigate("games")}
                sx={{
                  color:
                    currentPage === "games"
                      ? "#42a5f5"
                      : "rgba(255, 255, 255, 0.7)",
                  bgcolor:
                    currentPage === "games"
                      ? "rgba(25, 118, 210, 0.15)"
                      : "transparent",
                  border:
                    currentPage === "games"
                      ? "1px solid rgba(25, 118, 210, 0.4)"
                      : "1px solid transparent",
                  borderRadius: "8px",
                  px: 2,
                  py: 0.75,
                  fontWeight: currentPage === "games" ? 600 : 500,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "white",
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                  },
                }}
              >
                Games
              </Button>
              {["dashboard", "settings", "history"].map((page) => (
                <Button
                  key={page}
                  onClick={() => onNavigate(page as any)}
                  sx={{
                    color:
                      currentPage === page
                        ? "#42a5f5"
                        : "rgba(255, 255, 255, 0.7)",
                    bgcolor:
                      currentPage === page
                        ? "rgba(25, 118, 210, 0.15)"
                        : "transparent",
                    border:
                      currentPage === page
                        ? "1px solid rgba(25, 118, 210, 0.4)"
                        : "1px solid transparent",
                    borderRadius: "8px",
                    px: 2,
                    py: 0.75,
                    fontWeight: currentPage === page ? 600 : 500,
                    fontSize: "0.95rem",
                    textTransform: "capitalize",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "white",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    },
                  }}
                >
                  {page}
                </Button>
              ))}
              {user && user.role === "agent" && (
                <Button
                  onClick={() => onNavigate("agent")}
                  sx={{
                    color:
                      currentPage === "agent"
                        ? "#42a5f5"
                        : "rgba(255, 255, 255, 0.7)",
                    bgcolor:
                      currentPage === "agent"
                        ? "rgba(25, 118, 210, 0.15)"
                        : "transparent",
                    border:
                      currentPage === "agent"
                        ? "1px solid rgba(25, 118, 210, 0.4)"
                        : "1px solid transparent",
                    borderRadius: "8px",
                    px: 2,
                    py: 0.75,
                    fontWeight: currentPage === "agent" ? 600 : 500,
                    fontSize: "0.95rem",
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "white",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    },
                  }}
                >
                  Agent
                </Button>
              )}
            </Stack>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Bet Slip Button */}
            {betSlipItems.length > 0 && (
              <IconButton
                onClick={() => dispatch(toggleBetSlipVisibility())}
                sx={{
                  color: "white",
                  bgcolor: "rgba(25, 118, 210, 0.15)",
                  border: "1px solid rgba(25, 118, 210, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(25, 118, 210, 0.25)",
                    borderColor: "rgba(25, 118, 210, 0.5)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                  },
                }}
              >
                <Badge
                  badgeContent={betSlipItems.length}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#42a5f5",
                      color: "white",
                      fontWeight: 600,
                    },
                  }}
                >
                  <ReceiptIcon />
                </Badge>
              </IconButton>
            )}

            {/* User Menu */}
            {user && (
              <Box>
                <Button
                  onClick={handleUserMenuClick}
                  endIcon={
                    showUserDropdown ? <ArrowUpIcon /> : <ArrowDownIcon />
                  }
                  sx={{
                    color: "white",
                    textTransform: "none",
                    borderRadius: "12px",
                    px: 1.5,
                    py: 0.75,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      mr: 1,
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      boxShadow: "0 2px 8px rgba(25, 118, 210, 0.4)",
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={showUserDropdown}
                  onClose={handleUserMenuClose}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        minWidth: 320,
                        maxWidth: 400,
                        maxHeight: "80vh",
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                      },
                    },
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      p: 2,
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          background:
                            "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "white" }}
                        >
                          {user.name}
                        </Typography>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                            color: "rgba(255, 255, 255, 0.8)",
                            textTransform: "capitalize",
                            height: "20px",
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>

                  <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />

                  {/* Basic User Info */}
                  <MenuItem
                    disableRipple
                    sx={{
                      justifyContent: "space-between",
                      py: 1.5,
                      cursor: "default",
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      User ID
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "white" }}
                    >
                      {user.id}
                    </Typography>
                  </MenuItem>

                  <MenuItem sx={{ justifyContent: "space-between", py: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      Phone Number
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "white" }}
                    >
                      {user.phoneNumber}
                    </Typography>
                  </MenuItem>

                  <MenuItem sx={{ justifyContent: "space-between", py: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      Status
                    </Typography>
                    <Chip
                      label={user.isActive ? "🟢 Active" : "🔴 Inactive"}
                      size="small"
                      sx={{
                        bgcolor: user.isActive
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(239, 68, 68, 0.2)",
                        color: user.isActive ? "#4ade80" : "#f87171",
                        border: user.isActive
                          ? "1px solid rgba(34, 197, 94, 0.3)"
                          : "1px solid rgba(239, 68, 68, 0.3)",
                        height: "24px",
                        fontSize: "0.75rem",
                      }}
                    />
                  </MenuItem>

                  <MenuItem sx={{ justifyContent: "space-between", py: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      Balance
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: "#28a745",
                        fontSize: "1rem",
                      }}
                    >
                      {user.currency} {user.balance.toFixed(2)}
                    </Typography>
                  </MenuItem>

                  {/* Shop Information */}
                  {user.shop && [
                    <Divider
                      key="shop-divider"
                      sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                    />,
                    <Box
                      key="shop-header"
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: "rgba(255, 255, 255, 0.03)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Shop Information
                      </Typography>
                    </Box>,
                    <MenuItem
                      key="shop-name"
                      sx={{ justifyContent: "space-between", py: 1.5 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                      >
                        Shop Name
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "white" }}
                      >
                        {user.shop.shop_name}
                      </Typography>
                    </MenuItem>,
                    <MenuItem
                      key="shop-code"
                      sx={{ justifyContent: "space-between", py: 1.5 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                      >
                        Shop Code
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "white" }}
                      >
                        {user.shop.shop_code}
                      </Typography>
                    </MenuItem>,
                    user.role === "agent" && (
                      <MenuItem
                        key="commission-rate"
                        sx={{ justifyContent: "space-between", py: 1.5 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                        >
                          Commission Rate
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "white" }}
                        >
                          {user.shop.commission_rate}%
                        </Typography>
                      </MenuItem>
                    ),
                  ]}

                  {/* Betting Limits */}
                  {user.bettingLimits && [
                    <Divider
                      key="limits-divider"
                      sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                    />,
                    <Box
                      key="limits-header"
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: "rgba(255, 255, 255, 0.03)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Betting Limits
                      </Typography>
                    </Box>,
                    <MenuItem
                      key="min-max-stake"
                      sx={{ justifyContent: "space-between", py: 1.5 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                      >
                        Min/Max Stake
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "white" }}
                      >
                        {user.currency} {user.bettingLimits.minStake.toFixed(2)}{" "}
                        - {user.bettingLimits.maxStake.toFixed(2)}
                      </Typography>
                    </MenuItem>,
                    <MenuItem
                      key="max-daily-loss"
                      sx={{ justifyContent: "space-between", py: 1.5 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                      >
                        Max Daily Loss
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "white" }}
                      >
                        {user.currency}{" "}
                        {user.bettingLimits.maxDailyLoss.toFixed(2)}
                      </Typography>
                    </MenuItem>,
                  ]}

                  <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />

                  {/* Logout Button */}
                  <MenuItem
                    onClick={() => {
                      handleLogout();
                      handleUserMenuClose();
                    }}
                    sx={{
                      py: 1.5,
                      background:
                        "linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.8) 100%)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "white",
                      justifyContent: "center",
                      fontWeight: 600,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, rgba(239, 68, 68, 1) 0%, rgba(220, 38, 38, 1) 100%)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <LogoutIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

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
