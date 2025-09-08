import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { Header } from "../../components/Header";
import { DashboardTabs } from "../../components/dashboard/DashboardTabs";
import { UserStatsTab } from "../../components/dashboard/UserStatsTab";
import { ShopStatsTab } from "../../components/dashboard/ShopStatsTab";
import { PayoutTab } from "../../components/dashboard/PayoutTab";
import { BetsTab } from "../../components/dashboard/BetsTab";
import { useDashboardData } from "../../hooks/useDashboardData";
import { usePayoutData } from "../../hooks/usePayoutData";
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
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
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
    "user" | "shop" | "payout" | "bets"
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

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (activeTab === "payout") {
      loadPendingPayouts();
    } else if (activeTab === "bets") {
      loadRecentBets();
    }
  }, [activeTab, loadPendingPayouts, loadRecentBets]);

  // Validate payouts when pending payouts are loaded
  useEffect(() => {
    if (pendingPayouts.length > 0) {
      validateAllPayouts();
    }
  }, [pendingPayouts, validateAllPayouts]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tabs = ["user", "shop", "payout", "bets"];
    setActiveTab(tabs[newValue] as "user" | "shop" | "payout" | "bets");
  };

  const getTabIndex = (tab: string) => {
    const tabs = ["user", "shop", "payout", "bets"];
    return tabs.indexOf(tab);
  };

  return (
    <Box>
      <Header onNavigate={onNavigate} currentPage="dashboard" />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Enhanced Page Header */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
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
                "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
              pointerEvents: "none",
            },
          }}
        >
          <Box position="relative" zIndex={1}>
            <Stack direction="row" alignItems="center" spacing={3} mb={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <AssessmentIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" gutterBottom fontWeight="bold">
                  📊 Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                  Comprehensive overview of your betting activity and shop
                  performance
                </Typography>
              </Box>
            </Stack>

            {/* Quick Stats Row */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <TrendingUpIcon />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Total Activity
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {personalStats?.totalBets || 0}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <MoneyIcon />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Total Stake
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
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
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <TimelineIcon />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Win Rate
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {(personalStats?.winRate || 0).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <BetsIcon />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Pending Payouts
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {totalPayouts}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Enhanced Tab Navigation */}
        <Paper
          sx={{
            mb: 3,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            borderRadius: 3,
            overflow: "hidden",
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
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(102, 126, 234, 0.08)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-selected": {
                  bgcolor: "rgba(102, 126, 234, 0.12)",
                  color: "primary.main",
                  "& .MuiSvgIcon-root": {
                    transform: "scale(1.1)",
                  },
                },
              },
              "& .MuiTabs-indicator": {
                height: 4,
                borderRadius: "2px 2px 0 0",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
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
            <Tab icon={<BetsIcon />} label="Recent Bets" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Fade in={true} timeout={300}>
          <Box>
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
