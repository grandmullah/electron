import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Box,
  Typography,
  Stack,
  Avatar,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility as IconEye,
  Print as IconPrinter,
  AttachMoney as IconMoneybag,
  EmojiEvents as IconTrophy,
  Person as IconId,
  GpsFixed as IconTarget,
  MonetizationOn as IconCoins,
  TrendingUp as IconTrendingUp,
  CalendarToday as IconCalendar,
  CheckCircle as IconCheckCircle,
  Pending as IconPending,
  Cancel as IconCancel,
  Error as IconError,
  SportsSoccer as IconSoccer,
  Casino as IconCasino,
  Timeline as IconTimeline,
  AccountBalanceWallet as IconWallet,
  Speed as IconSpeed,
  Star as IconStar,
  FlashOn as IconFlash,
  ExpandMore as IconExpandMore,
  ExpandLess as IconExpandLess,
  ThumbUp as IconThumbUp,
  ThumbDown as IconThumbDown,
} from "@mui/icons-material";
import { DisplayBet } from "../../types/history";
import GameScoreDisplay from "./GameScoreDisplay";

interface MUIBetTableProps {
  bets: DisplayBet[];
  onPrint: (bet: DisplayBet) => void;
  onView: (bet: DisplayBet) => void;
  onPayout: (bet: DisplayBet) => void;
  onCancel: (bet: DisplayBet) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const getStatusVariant = (status: string): "filled" | "outlined" => {
  switch (status.toLowerCase()) {
    case "won":
    case "completed":
      return "filled";
    case "pending":
    case "processing":
      return "outlined";
    case "lost":
    case "cancelled":
    case "failed":
      return "filled";
    default:
      return "outlined";
  }
};

const getStatusColorScheme = (
  status: string
): "success" | "warning" | "error" | "default" => {
  switch (status.toLowerCase()) {
    case "won":
    case "completed":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "lost":
    case "cancelled":
    case "failed":
      return "error";
    case "accepted":
      return "default";
    default:
      return "default";
  }
};

const formatCurrency = (amount: number, currency: string): string => {
  return `${currency} ${(amount || 0).toFixed(2)}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPaymentStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case "paid":
      return <IconCheckCircle fontSize="small" />;
    case "pending":
      return <IconPending fontSize="small" />;
    case "no_payout":
      return <IconCancel fontSize="small" />;
    case "no_payment_needed":
      return <IconCancel fontSize="small" />;
    case "failed":
      return <IconError fontSize="small" />;
    case "cancelled":
      return <IconCancel fontSize="small" />;
    default:
      return <IconPending fontSize="small" />;
  }
};

const getPaymentStatusColor = (
  status: string
): "success" | "warning" | "error" | "default" => {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "no_payout":
      return "default";
    case "no_payment_needed":
      return "default";
    case "failed":
      return "error";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const getPaymentStatusVariant = (status: string): "filled" | "outlined" => {
  switch (status) {
    case "paid":
      return "filled";
    case "pending":
      return "outlined";
    case "no_payout":
      return "outlined";
    case "no_payment_needed":
      return "outlined";
    case "failed":
      return "filled";
    case "cancelled":
      return "filled";
    default:
      return "outlined";
  }
};

const getBetTypeIcon = (betType: string): React.ReactNode => {
  switch (betType.toLowerCase()) {
    case "single":
      return <IconTarget fontSize="small" />;
    case "multibet":
      return <IconTimeline fontSize="small" />;
    default:
      return <IconCasino fontSize="small" />;
  }
};

const getBetTypeColor = (betType: string): string => {
  switch (betType.toLowerCase()) {
    case "single":
      return "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(156, 39, 176, 0.8) 100%)";
    case "multibet":
      return "linear-gradient(135deg, rgba(156, 39, 176, 0.8) 0%, rgba(233, 30, 99, 0.8) 100%)";
    default:
      return "linear-gradient(135deg, rgba(76, 175, 80, 0.8) 0%, rgba(139, 195, 74, 0.8) 100%)";
  }
};

const getStatusGradient = (status: string): string => {
  switch (status.toLowerCase()) {
    case "won":
      return "linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(139, 195, 74, 0.2) 100%)";
    case "lost":
      return "linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(233, 30, 99, 0.2) 100%)";
    case "pending":
      return "linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)";
    case "cancelled":
      return "linear-gradient(135deg, rgba(158, 158, 158, 0.2) 0%, rgba(97, 97, 97, 0.2) 100%)";
    default:
      return "linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(103, 58, 183, 0.2) 100%)";
  }
};

const getSelectionIcon = (betType: string): React.ReactNode => {
  switch (betType.toLowerCase()) {
    case "h2h":
      return <IconSoccer fontSize="small" />;
    case "totals":
      return <IconTrendingUp fontSize="small" />;
    case "spreads":
      return <IconSpeed fontSize="small" />;
    default:
      return <IconTarget fontSize="small" />;
  }
};

export const MUIBetTable: React.FC<MUIBetTableProps> = ({
  bets,
  onPrint,
  onView,
  onPayout,
  onCancel,
  getStatusColor,
  getStatusIcon,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

  // State for managing expanded selections
  const [expandedSelections, setExpandedSelections] = useState<Set<string>>(
    new Set()
  );

  // Helper functions for managing expanded state
  const toggleSelectionsExpansion = (betId: string) => {
    setExpandedSelections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(betId)) {
        newSet.delete(betId);
      } else {
        newSet.add(betId);
      }
      return newSet;
    });
  };

  const isSelectionsExpanded = (betId: string) => expandedSelections.has(betId);

  const getVisibleSelections = (bet: DisplayBet) => {
    const maxVisible = 3; // Show only first 3 selections by default
    const isExpanded = isSelectionsExpanded(bet.betId);

    if (bet.selections.length <= maxVisible || isExpanded) {
      return bet.selections;
    }

    return bet.selections.slice(0, maxVisible);
  };

  // Responsive text sizes
  const getResponsiveTextSize = (baseSize: string) => {
    if (isMobile) return "0.7rem";
    if (isTablet) return "0.75rem";
    if (isSmallScreen) return "0.8rem";
    return baseSize;
  };

  // Responsive spacing
  const getResponsiveSpacing = (baseSpacing: number) => {
    if (isMobile) return baseSpacing * 0.5;
    if (isTablet) return baseSpacing * 0.7;
    if (isSmallScreen) return baseSpacing * 0.8;
    return baseSpacing;
  };

  // Responsive avatar size
  const getResponsiveAvatarSize = (baseSize: number) => {
    if (isMobile) return baseSize * 0.7;
    if (isTablet) return baseSize * 0.8;
    if (isSmallScreen) return baseSize * 0.9;
    return baseSize;
  };

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 4,
        overflow: "hidden",
        background:
          "linear-gradient(145deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 30, 0.6) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow:
          "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.8) 25%, rgba(156, 39, 176, 0.8) 50%, rgba(233, 30, 99, 0.8) 75%, transparent 100%)",
          zIndex: 1,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.05) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: isMobile ? 2 : 4,
          overflow: "auto",
          background: "transparent",
          backdropFilter: "blur(20px)",
          border: "none",
          boxShadow: "none",
          position: "relative",
          zIndex: 1,
          maxHeight: isMobile ? "70vh" : "none",
          "&::-webkit-scrollbar": {
            width: isMobile ? "4px" : "8px",
            height: isMobile ? "4px" : "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(102, 126, 234, 0.6)",
            borderRadius: "4px",
            "&:hover": {
              background: "rgba(102, 126, 234, 0.8)",
            },
          },
        }}
      >
        <Table
          sx={{
            "& .MuiTableCell-root": {
              color: "rgba(255,255,255,0.8)",
              borderColor: "rgba(255,255,255,0.1)",
              padding: isMobile
                ? "8px 4px"
                : isTablet
                  ? "10px 6px"
                  : "12px 8px",
              verticalAlign: "top",
              fontSize: getResponsiveTextSize("0.875rem"),
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              padding: isMobile
                ? "12px 4px"
                : isTablet
                  ? "14px 6px"
                  : "16px 8px",
              verticalAlign: "middle",
              fontSize: getResponsiveTextSize("0.875rem"),
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                background:
                  "linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 30, 0.95) 100%)",
                backdropFilter: "blur(20px)",
                borderBottom: "2px solid rgba(102, 126, 234, 0.3)",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.6) 25%, rgba(156, 39, 176, 0.6) 50%, rgba(233, 30, 99, 0.6) 75%, transparent 100%)",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
                },
              }}
            >
              <TableCell
                sx={{
                  color: "white !important",
                  fontWeight: 700,
                  fontSize: getResponsiveTextSize("0.875rem"),
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "0.3px" : "0.5px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  width: isMobile ? "15%" : "12%",
                  minWidth: isMobile ? "80px" : "120px",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: isMobile ? "2px" : "3px",
                    height: isMobile ? "16px" : "20px",
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(156, 39, 176, 0.8) 100%)",
                    borderRadius: "0 2px 2px 0",
                  },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={getResponsiveSpacing(1)}
                >
                  <IconId fontSize={isMobile ? "small" : "small"} />
                  {isMobile ? "ID" : "Bet ID"}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  color: "white !important",
                  fontWeight: 700,
                  fontSize: getResponsiveTextSize("0.875rem"),
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "0.3px" : "0.5px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  width: isMobile ? "25%" : "20%",
                  minWidth: isMobile ? "120px" : "200px",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={getResponsiveSpacing(1)}
                >
                  <IconSoccer fontSize="small" />
                  {isMobile ? "Games" : "Selections"}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  color: "white !important",
                  fontWeight: 700,
                  fontSize: getResponsiveTextSize("0.875rem"),
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "0.3px" : "0.5px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  width: isMobile ? "12%" : "10%",
                  minWidth: isMobile ? "70px" : "100px",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={getResponsiveSpacing(1)}
                >
                  <IconCoins fontSize="small" />
                  {isMobile ? "S" : "Stake"}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  color: "white !important",
                  fontWeight: 700,
                  fontSize: getResponsiveTextSize("0.875rem"),
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "0.3px" : "0.5px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  width: isMobile ? "10%" : "8%",
                  minWidth: isMobile ? "60px" : "80px",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={getResponsiveSpacing(1)}
                >
                  <IconTrendingUp fontSize="small" />
                  {isMobile ? "O" : "Odds"}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  color: "white !important",
                  fontWeight: 700,
                  fontSize: getResponsiveTextSize("0.875rem"),
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "0.3px" : "0.5px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  width: isMobile ? "15%" : "12%",
                  minWidth: isMobile ? "80px" : "120px",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={getResponsiveSpacing(1)}
                >
                  <IconTrophy fontSize="small" />
                  {isMobile ? "Win" : "Potential Win"}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  color: "white !important",
                  fontWeight: 700,
                  fontSize: getResponsiveTextSize("0.875rem"),
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "0.3px" : "0.5px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  width: isMobile ? "12%" : "10%",
                  minWidth: isMobile ? "70px" : "100px",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={getResponsiveSpacing(1)}
                >
                  <IconStar fontSize="small" />
                  {isMobile ? "S" : "Status"}
                </Box>
              </TableCell>
              {!isMobile && (
                <TableCell
                  sx={{
                    color: "white !important",
                    fontWeight: 700,
                    fontSize: getResponsiveTextSize("0.875rem"),
                    textTransform: "uppercase",
                    letterSpacing: isMobile ? "0.3px" : "0.5px",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                    width: "15%",
                    minWidth: "150px",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={getResponsiveSpacing(1)}
                  >
                    <IconWallet fontSize="small" />
                    Payment Status
                  </Box>
                </TableCell>
              )}
              <TableCell
                sx={{
                  color: "white !important",
                  fontWeight: 700,
                  fontSize: getResponsiveTextSize("0.875rem"),
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "0.3px" : "0.5px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  width: isMobile ? "15%" : "12%",
                  minWidth: isMobile ? "80px" : "120px",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={getResponsiveSpacing(1)}
                >
                  <IconCalendar fontSize="small" />
                  {isMobile ? "D" : "Date"}
                </Box>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white !important",
                  fontWeight: 700,
                  fontSize: getResponsiveTextSize("0.875rem"),
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "0.3px" : "0.5px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  width: isMobile ? "18%" : "15%",
                  minWidth: isMobile ? "100px" : "150px",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={getResponsiveSpacing(1)}
                  justifyContent="center"
                >
                  <IconFlash fontSize="small" />
                  {isMobile ? "A" : "Actions"}
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bets.map((bet, index) => (
              <Fade
                in={true}
                timeout={300 + index * 100}
                key={bet.betId || bet["id"]}
              >
                <TableRow
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    "&:nth-of-type(even)": {
                      backgroundColor: "rgba(255,255,255,0.03)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: getStatusGradient(bet.status),
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                      zIndex: 0,
                    },
                    "& .MuiTableCell-root": {
                      position: "relative",
                      zIndex: 1,
                    },
                  }}
                >
                  <TableCell>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={getResponsiveSpacing(1.5)}
                    >
                      <Avatar
                        sx={{
                          width: getResponsiveAvatarSize(36),
                          height: getResponsiveAvatarSize(36),
                          background: getBetTypeColor(bet.betType),
                          backdropFilter: "blur(10px)",
                          border: isMobile
                            ? "1px solid rgba(255, 255, 255, 0.2)"
                            : "2px solid rgba(255, 255, 255, 0.2)",
                          boxShadow:
                            "0 6px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.1)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                          },
                        }}
                      >
                        {getBetTypeIcon(bet.betType)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            color: "rgba(255,255,255,0.95)",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                            letterSpacing: "0.3px",
                            fontSize: getResponsiveTextSize("0.875rem"),
                          }}
                        >
                          {bet.betId
                            ? bet.betId.substring(0, isMobile ? 6 : 8) + "..."
                            : "Unknown"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            fontSize: getResponsiveTextSize("0.7rem"),
                          }}
                        >
                          {bet.betType}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={1}>
                      {getVisibleSelections(bet).map((selection, selIndex) => (
                        <Card
                          key={selIndex}
                          sx={{
                            background:
                              "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 2,
                            p: 1,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                              transform: "translateX(4px)",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            },
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box flex={1}>
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mb={0.5}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    color: "rgba(255,255,255,0.95)",
                                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                                  }}
                                >
                                  {selection.homeTeam} vs {selection.awayTeam}
                                </Typography>
                                {/* Game Score Display */}
                                {selection.gameScore && (
                                  <GameScoreDisplay
                                    score={selection.gameScore}
                                  />
                                )}
                              </Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "rgba(255,255,255,0.6)",
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  display: "block",
                                }}
                              >
                                {selection.betType}: {selection.selection}
                              </Typography>
                              {/* Selection Outcome */}
                              {selection.selectionOutcome && (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  mt={0.5}
                                >
                                  {/* Thumbs Up/Down Icon for Won/Lost */}
                                  {selection.selectionOutcome === "won" && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        background: "rgba(76, 175, 80, 0.2)",
                                        border:
                                          "1px solid rgba(76, 175, 80, 0.4)",
                                      }}
                                    >
                                      <IconThumbUp
                                        sx={{
                                          fontSize: "0.9rem",
                                          color: "#4caf50",
                                        }}
                                      />
                                    </Box>
                                  )}
                                  {selection.selectionOutcome === "lost" && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        background: "rgba(244, 67, 54, 0.2)",
                                        border:
                                          "1px solid rgba(244, 67, 54, 0.4)",
                                      }}
                                    >
                                      <IconThumbDown
                                        sx={{
                                          fontSize: "0.9rem",
                                          color: "#f44336",
                                        }}
                                      />
                                    </Box>
                                  )}
                                  <Chip
                                    label={selection.selectionOutcome}
                                    size="small"
                                    color={
                                      selection.selectionOutcome === "won"
                                        ? "success"
                                        : selection.selectionOutcome === "lost"
                                          ? "error"
                                          : selection.selectionOutcome ===
                                              "void"
                                            ? "default"
                                            : "warning"
                                    }
                                    sx={{
                                      fontSize: "0.6rem",
                                      height: "18px",
                                      fontWeight: 600,
                                      textTransform: "uppercase",
                                    }}
                                  />
                                  {selection.odds && (
                                    <Chip
                                      label={`@ ${selection.odds.decimal?.toFixed(2) || "N/A"}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: "0.6rem",
                                        height: "18px",
                                        color: "rgba(255,255,255,0.8)",
                                        borderColor: "rgba(255,255,255,0.3)",
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Card>
                      ))}

                      {/* Show More/Less Button for multibets with many selections */}
                      {bet.selections.length > 3 && (
                        <Button
                          size="small"
                          onClick={() => toggleSelectionsExpansion(bet.betId)}
                          startIcon={
                            isSelectionsExpanded(bet.betId) ? (
                              <IconExpandLess fontSize="small" />
                            ) : (
                              <IconExpandMore fontSize="small" />
                            )
                          }
                          sx={{
                            background: "rgba(102, 126, 234, 0.1)",
                            color: "#667eea",
                            border: "1px solid rgba(102, 126, 234, 0.3)",
                            borderRadius: 2,
                            textTransform: "none",
                            fontSize: getResponsiveTextSize("0.7rem"),
                            fontWeight: 600,
                            minWidth: "auto",
                            px: 2,
                            py: 0.5,
                            "&:hover": {
                              background: "rgba(102, 126, 234, 0.2)",
                              border: "1px solid rgba(102, 126, 234, 0.5)",
                              transform: "scale(1.02)",
                            },
                          }}
                        >
                          {isSelectionsExpanded(bet.betId)
                            ? `Show Less`
                            : `+${bet.selections.length - 3} More`}
                        </Button>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)",
                        borderRadius: 2,
                        p: 1.5,
                        border: "1px solid rgba(76, 175, 80, 0.2)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(139, 195, 74, 0.15) 100%)",
                          transform: "scale(1.02)",
                          boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: "rgba(255,255,255,0.95)",
                          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {formatCurrency(bet.totalStake, "SSP")}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)",
                        borderRadius: 2,
                        p: 1.5,
                        border: "1px solid rgba(255, 193, 7, 0.2)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%)",
                          transform: "scale(1.02)",
                          boxShadow: "0 4px 12px rgba(255, 193, 7, 0.2)",
                        },
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            color: "rgba(255,255,255,0.95)",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {bet.betType === "multibet"
                            ? bet.combinedOdds?.toFixed(2) || "N/A"
                            : bet.combinedOdds?.toFixed(2) || "N/A"}
                        </Typography>
                        {bet.betType === "multibet" && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255,255,255,0.7)",
                              fontWeight: 500,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            ({bet.selections.length}×)
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)",
                        borderRadius: 2,
                        p: 1.5,
                        border: "1px solid rgba(156, 39, 176, 0.2)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(233, 30, 99, 0.15) 100%)",
                          transform: "scale(1.02)",
                          boxShadow: "0 4px 12px rgba(156, 39, 176, 0.2)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: "rgba(255,255,255,0.95)",
                          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {formatCurrency(bet.potentialWinnings, "SSP")}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={getStatusIcon(bet.status) as React.ReactElement}
                      label={bet.status}
                      color={getStatusColorScheme(bet.status)}
                      variant={getStatusVariant(bet.status)}
                      size="small"
                      sx={{
                        background: getStatusGradient(bet.status),
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow:
                          "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
                        },
                        ...(bet.status.toLowerCase() === "accepted" && {
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          color: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(0,0,0,0.2)",
                          "& .MuiChip-icon": {
                            color: "rgba(0,0,0,0.6)",
                          },
                        }),
                      }}
                    />
                  </TableCell>

                  {!isMobile && (
                    <TableCell sx={{ verticalAlign: "top" }}>
                      {bet.paymentStatus ? (
                        <Card
                          sx={{
                            background:
                              "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 2,
                            p: getResponsiveSpacing(1.5),
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            },
                          }}
                        >
                          <Stack spacing={getResponsiveSpacing(1)}>
                            <Chip
                              icon={
                                getPaymentStatusIcon(
                                  bet.paymentStatus.status
                                ) as React.ReactElement
                              }
                              label={bet.paymentStatus.status
                                .replace("_", " ")
                                .toUpperCase()}
                              color={getPaymentStatusColor(
                                bet.paymentStatus.status
                              )}
                              variant={getPaymentStatusVariant(
                                bet.paymentStatus.status
                              )}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                fontSize: getResponsiveTextSize("0.75rem"),
                              }}
                            />
                            {bet.paymentStatus.payoutAmount && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "rgba(255,255,255,0.8)",
                                  fontWeight: 600,
                                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                                  fontSize: getResponsiveTextSize("0.7rem"),
                                }}
                              >
                                {formatCurrency(
                                  bet.paymentStatus.payoutAmount,
                                  "SSP"
                                )}
                              </Typography>
                            )}
                            {bet.paymentStatus.paymentMethod && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "rgba(255,255,255,0.7)",
                                  fontSize: getResponsiveTextSize("0.65rem"),
                                  fontWeight: 500,
                                }}
                              >
                                via {bet.paymentStatus.paymentMethod}
                              </Typography>
                            )}
                            {bet.paymentStatus.payoutId && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "rgba(255,255,255,0.6)",
                                  fontSize: getResponsiveTextSize("0.6rem"),
                                  fontFamily: "monospace",
                                }}
                              >
                                ID: {bet.paymentStatus.payoutId}
                              </Typography>
                            )}
                          </Stack>
                        </Card>
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.5)",
                            fontStyle: "italic",
                            fontSize: getResponsiveTextSize("0.7rem"),
                          }}
                        >
                          No payment info
                        </Typography>
                      )}
                    </TableCell>
                  )}

                  <TableCell>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(103, 58, 183, 0.1) 100%)",
                        borderRadius: 2,
                        p: 1.5,
                        border: "1px solid rgba(33, 150, 243, 0.2)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(103, 58, 183, 0.15) 100%)",
                          transform: "scale(1.02)",
                          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.2)",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          background:
                            "linear-gradient(135deg, rgba(33, 150, 243, 0.8) 0%, rgba(103, 58, 183, 0.8) 100%)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <IconCalendar fontSize="small" />
                      </Avatar>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color: "rgba(255,255,255,0.95)",
                          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {formatDate(bet.createdAt || bet.timestamp || "")}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center" sx={{ verticalAlign: "top" }}>
                    <Box
                      display="flex"
                      gap={1}
                      justifyContent="center"
                      flexWrap="wrap"
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
                        borderRadius: 3,
                        p: 1.5,
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      <Tooltip title="View Details">
                        <Button
                          size="small"
                          onClick={() => onView(bet)}
                          startIcon={<IconEye />}
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            minWidth: "auto",
                            px: 2,
                            py: 1,
                            background:
                              "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            "&:hover": {
                              backgroundColor:
                                "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(156, 39, 176, 0.2) 100%)",
                              color: "rgba(255,255,255,1)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 16px rgba(102, 126, 234, 0.3)",
                            },
                          }}
                        >
                          View
                        </Button>
                      </Tooltip>

                      <Tooltip title="Print Ticket">
                        <Button
                          size="small"
                          onClick={() => onPrint(bet)}
                          startIcon={<IconPrinter />}
                          sx={{
                            color: "#9c27b0",
                            minWidth: "auto",
                            px: 2,
                            py: 1,
                            background:
                              "linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(156, 39, 176, 0.2)",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            "&:hover": {
                              backgroundColor:
                                "linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(233, 30, 99, 0.2) 100%)",
                              color: "#9c27b0",
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 16px rgba(156, 39, 176, 0.3)",
                            },
                          }}
                        >
                          Print
                        </Button>
                      </Tooltip>

                      {bet.status === "won" &&
                        (!bet.paymentStatus ||
                          bet.paymentStatus.status !== "paid") && (
                          <Tooltip title="Process Payout">
                            <Button
                              size="small"
                              onClick={() => onPayout(bet)}
                              startIcon={<IconMoneybag />}
                              sx={{
                                color: "#4caf50",
                                minWidth: "auto",
                                px: 2,
                                py: 1,
                                background:
                                  "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(76, 175, 80, 0.2)",
                                borderRadius: 2,
                                transition: "all 0.3s ease",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                "&:hover": {
                                  backgroundColor:
                                    "linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(139, 195, 74, 0.2) 100%)",
                                  color: "#4caf50",
                                  transform: "translateY(-2px)",
                                  boxShadow:
                                    "0 6px 16px rgba(76, 175, 80, 0.3)",
                                },
                              }}
                            >
                              Payout
                            </Button>
                          </Tooltip>
                        )}

                      {(bet.status === "accepted" ||
                        bet.status === "pending") && (
                        <Tooltip title="Cancel Bet">
                          <Button
                            size="small"
                            onClick={() => onCancel(bet)}
                            startIcon={<IconCancel />}
                            sx={{
                              color: "#f44336",
                              minWidth: "auto",
                              px: 2,
                              py: 1,
                              background:
                                "linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(229, 57, 53, 0.1) 100%)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(244, 67, 54, 0.2)",
                              borderRadius: 2,
                              transition: "all 0.3s ease",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              "&:hover": {
                                backgroundColor:
                                  "linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(229, 57, 53, 0.2) 100%)",
                                color: "#f44336",
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 16px rgba(244, 67, 54, 0.3)",
                              },
                            }}
                          >
                            Cancel
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              </Fade>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
