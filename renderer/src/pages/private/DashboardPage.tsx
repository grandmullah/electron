import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { Header } from "../../components/Header";
import { DashboardTabs } from "../../components/dashboard/DashboardTabs";
import { UserStatsTab } from "../../components/dashboard/UserStatsTab";
import { ShopStatsTab } from "../../components/dashboard/ShopStatsTab";
import { PayoutTab } from "../../components/dashboard/PayoutTab";
import { FinancialTab } from "../../components/dashboard/FinancialTab";
import { BetsTab } from "../../components/dashboard/BetsTab";
import { useDashboardData } from "../../hooks/useDashboardData";
import { usePayoutData } from "../../hooks/usePayoutData";
import { usePayoutSummary } from "../../hooks/usePayoutSummary";
import { useFinancialSummary } from "../../hooks/useFinancialSummary";
import { useBetsData } from "../../hooks/useBetsData";
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Badge,
  Fade,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
  Grid,
} from "@mui/material";
import {
  Person as PersonIcon,
  Store as StoreIcon,
  AttachMoney as MoneyIcon,
  SportsEsports as BetsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

interface DashboardPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAppSelector((state) => state.auth);

  // Tab state
  const [activeTab, setActiveTab] = useState<
    "user" | "shop" | "payout" | "financial" | "bets"
  >("user");

  // Use custom hooks for data management
  const {
    personalStats,
    shopStats,
    dashboardStats,
    isLoadingStats,
    statsError,
    loadDashboardData,
  } = useDashboardData();

  const {
    pendingPayouts,
    totalPayouts,
    isLoadingPayouts,
    payoutError,
    validatingPayouts,
    payoutValidationResults,
    isExportingPayouts,
    completingPayouts,
    loadPendingPayouts,
    validatePayoutForBet,
    validateAllPayouts,
    completePayout,
    exportPayoutsToExcel,
  } = usePayoutData();

  const { recentBets, isLoadingBets, betsError, loadRecentBets } =
    useBetsData();

  const {
    payoutSummary,
    isLoadingSummary,
    summaryError,
    loadPayoutSummary,
    formatCurrency,
  } = usePayoutSummary();

  const {
    financialSummary,
    periodSummaries,
    isLoadingFinancialSummary,
    financialSummaryError,
    loadFinancialSummary,
    loadFinancialSummaryForPeriods,
    formatCurrency: formatFinancialCurrency,
    getProfitMarginColor,
    getWinRateColor,
  } = useFinancialSummary();

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (activeTab === "payout") {
      loadPendingPayouts();
      loadPayoutSummary();
    } else if (activeTab === "financial") {
      loadFinancialSummary(30);
      loadFinancialSummaryForPeriods();
    } else if (activeTab === "bets") {
      loadRecentBets();
    }
  }, [
    activeTab,
    loadPendingPayouts,
    loadPayoutSummary,
    loadFinancialSummary,
    loadFinancialSummaryForPeriods,
    loadRecentBets,
  ]);

  // Load payout summary on component mount
  useEffect(() => {
    loadPayoutSummary();
  }, [loadPayoutSummary]);

  // Validate payouts when pending payouts are loaded
  useEffect(() => {
    if (pendingPayouts.length > 0) {
      validateAllPayouts();
    }
  }, [pendingPayouts, validateAllPayouts]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tabs = ["user", "shop", "payout", "financial", "bets"];
    setActiveTab(
      tabs[newValue] as "user" | "shop" | "payout" | "financial" | "bets"
    );
  };

  const getTabIndex = (tab: string) => {
    const tabs = ["user", "shop", "payout", "financial", "bets"];
    return tabs.indexOf(tab);
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 25%, #2d3748 50%, #1a1f2e 75%, #0a0e1a 100%)",
        minHeight: "100vh",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Header onNavigate={onNavigate} currentPage="dashboard" />

      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        {/* Enhanced Page Header */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 4,
            boxShadow:
              "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.05) 100%)",
              pointerEvents: "none",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
            },
          }}
        >
          <Box position="relative" zIndex={1}>
            <Stack direction="row" alignItems="center" spacing={3} mb={3}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <AssessmentIcon
                  sx={{ fontSize: 36, color: "rgba(255, 255, 255, 0.9)" }}
                />
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  gutterBottom
                  fontWeight="bold"
                  sx={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  📊 Dashboard
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.85,
                    fontWeight: 300,
                    color: "rgba(255, 255, 255, 0.8)",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Comprehensive overview of your betting activity and shop
                  performance
                </Typography>
              </Box>
            </Stack>

            {/* Quick Stats Row */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 3,
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    color: "white",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow:
                        "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)",
                          border: "1px solid rgba(76, 175, 80, 0.3)",
                        }}
                      >
                        <TrendingUpIcon
                          sx={{ color: "#4CAF50", fontSize: 24 }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.7,
                            color: "rgba(255, 255, 255, 0.8)",
                            fontWeight: 500,
                          }}
                        >
                          Total Activity
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color: "rgba(255, 255, 255, 0.95)",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          {personalStats?.totalBets || 0}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 3,
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    color: "white",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow:
                        "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.1) 100%)",
                          border: "1px solid rgba(33, 150, 243, 0.3)",
                        }}
                      >
                        <MoneyIcon sx={{ color: "#2196F3", fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.7,
                            color: "rgba(255, 255, 255, 0.8)",
                            fontWeight: 500,
                          }}
                        >
                          Total Stake
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color: "rgba(255, 255, 255, 0.95)",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          SSP{" "}
                          {(
                            (personalStats?.totalStake || 0) +
                            (shopStats?.totalStake || 0)
                          ).toFixed(0)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 3,
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    color: "white",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow:
                        "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%)",
                          border: "1px solid rgba(255, 152, 0, 0.3)",
                        }}
                      >
                        <TimelineIcon sx={{ color: "#FF9800", fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.7,
                            color: "rgba(255, 255, 255, 0.8)",
                            fontWeight: 500,
                          }}
                        >
                          Win Rate
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color: "rgba(255, 255, 255, 0.95)",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          {(personalStats?.winRate || 0).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 3,
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    color: "white",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow:
                        "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(156, 39, 176, 0.1) 100%)",
                          border: "1px solid rgba(156, 39, 176, 0.3)",
                        }}
                      >
                        <BetsIcon sx={{ color: "#9C27B0", fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.7,
                            color: "rgba(255, 255, 255, 0.8)",
                            fontWeight: 500,
                          }}
                        >
                          Pending Payouts
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color: "rgba(255, 255, 255, 0.95)",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          {payoutSummary?.pending.count || totalPayouts}
                        </Typography>
                        {payoutSummary?.pending.totalAmount && (
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.6,
                              color: "rgba(255, 255, 255, 0.7)",
                            }}
                          >
                            {formatCurrency(payoutSummary.pending.totalAmount)}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Enhanced Tab Navigation */}
        <Paper
          sx={{
            mb: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 4,
            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
            },
          }}
        >
          <Tabs
            value={getTabIndex(activeTab)}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                minHeight: 72,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                color: "rgba(255,255,255,0.6)",
                position: "relative",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "rgba(255,255,255,0.9)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                },
                "&.Mui-selected": {
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  "& .MuiSvgIcon-root": {
                    transform: "scale(1.1)",
                    color: "rgba(255,255,255,0.9)",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
                  },
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "0 0 4px 4px",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)",
                boxShadow: "0 2px 8px rgba(255,255,255,0.1)",
              },
            }}
          >
            <Tab
              icon={<PersonIcon />}
              label="User Statistics"
              iconPosition="start"
            />
            <Tab
              icon={<StoreIcon />}
              label="Shop Analytics"
              iconPosition="start"
            />
            <Tab
              icon={
                <Badge
                  badgeContent={totalPayouts}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.75rem",
                      height: 20,
                      minWidth: 20,
                    },
                  }}
                >
                  <MoneyIcon />
                </Badge>
              }
              label="Payout Management"
              iconPosition="start"
            />
            <Tab
              icon={<AssessmentIcon />}
              label="Financial Analytics"
              iconPosition="start"
            />
            <Tab icon={<BetsIcon />} label="Recent Bets" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Fade in={true} timeout={300}>
          <Box
            sx={{
              backgroundColor: "transparent",
              "& .MuiPaper-root": {
                backgroundColor: "rgba(26, 29, 41, 0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              },
            }}
          >
            {activeTab === "user" && (
              <UserStatsTab
                personalStats={personalStats}
                dashboardStats={dashboardStats}
                isLoadingStats={isLoadingStats}
                statsError={statsError}
                onRetry={loadDashboardData}
              />
            )}

            {activeTab === "shop" && (
              <ShopStatsTab
                shopStats={shopStats}
                dashboardStats={dashboardStats}
                isLoadingStats={isLoadingStats}
                statsError={statsError}
                onRetry={loadDashboardData}
                userShop={user?.shop}
              />
            )}

            {activeTab === "payout" && (
              <PayoutTab
                pendingPayouts={pendingPayouts}
                totalPayouts={totalPayouts}
                isLoadingPayouts={isLoadingPayouts}
                payoutError={payoutError}
                validatingPayouts={validatingPayouts}
                payoutValidationResults={payoutValidationResults}
                isExportingPayouts={isExportingPayouts}
                completingPayouts={completingPayouts}
                onLoadPendingPayouts={loadPendingPayouts}
                onValidatePayoutForBet={validatePayoutForBet}
                onCompletePayout={completePayout}
                onExportPayoutsToExcel={exportPayoutsToExcel}
                onNavigate={
                  onNavigate as (
                    page:
                      | "home"
                      | "dashboard"
                      | "settings"
                      | "games"
                      | "agent"
                      | "history"
                  ) => void
                }
              />
            )}

            {activeTab === "financial" && (
              <FinancialTab
                financialSummary={financialSummary}
                periodSummaries={periodSummaries}
                isLoadingSummary={isLoadingFinancialSummary}
                summaryError={financialSummaryError}
                isLoadingPeriods={isLoadingFinancialSummary}
                periodsError={financialSummaryError}
                onRetry={() => {
                  loadFinancialSummary(30);
                  loadFinancialSummaryForPeriods();
                }}
                formatCurrency={formatFinancialCurrency}
                getProfitMarginColor={getProfitMarginColor}
                getWinRateColor={getWinRateColor}
              />
            )}

            {activeTab === "bets" && (
              <BetsTab
                recentBets={recentBets}
                isLoadingBets={isLoadingBets}
                betsError={betsError}
                onLoadRecentBets={loadRecentBets}
              />
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};
