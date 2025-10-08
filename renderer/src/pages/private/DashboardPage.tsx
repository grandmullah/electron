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

interface NavigationParams {
  tab?: string;
  [key: string]: any;
}

interface DashboardPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history",
    params?: NavigationParams
  ) => void;
  navigationParams?: NavigationParams;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  navigationParams,
}) => {
  const { user } = useAppSelector((state) => state.auth);

  // Tab state - initialize with navigation params if provided
  const [activeTab, setActiveTab] = useState<
    "user" | "shop" | "payout" | "financial" | "bets"
  >((navigationParams?.tab as any) || "user");

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
    allPayouts,
    pendingPayouts,
    completedPayouts,
    totalPayouts,
    payoutSummary: payoutCounts,
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
    getFinancialAnalysis,
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

  // Handle navigation parameters
  useEffect(() => {
    if (navigationParams?.tab) {
      setActiveTab(navigationParams.tab as any);
    }
  }, [navigationParams]);

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
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        minHeight: "100vh",
        position: "relative",
        color: "text.primary",
      }}
    >
      <Header onNavigate={onNavigate} currentPage="dashboard" />

      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        {/* Dark Theme Page Header */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "text.primary",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box position="relative" zIndex={1}>
            <Stack direction="row" alignItems="center" spacing={3} mb={3}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                  border: "3px solid rgba(25, 118, 210, 0.3)",
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                }}
              >
                <AssessmentIcon sx={{ fontSize: 36, color: "white" }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  gutterBottom
                  fontWeight="bold"
                  sx={{
                    color: "text.primary",
                  }}
                >
                  📊 Dashboard
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 300,
                    color: "text.secondary",
                  }}
                >
                  Comprehensive overview of your betting activity and shop
                  performance
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* Dark Theme Tab Navigation */}
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            borderRadius: 2,
            backgroundColor: "grey.800",
            border: "1px solid",
            borderColor: "grey.700",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={getTabIndex(activeTab)}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                minHeight: 64,
                fontSize: "0.95rem",
                fontWeight: 600,
                textTransform: "none",
                transition: "all 0.3s ease",
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "grey.700",
                  color: "text.primary",
                },
                "&.Mui-selected": {
                  color: "primary.main",
                  backgroundColor: "grey.700",
                  "& .MuiSvgIcon-root": {
                    color: "primary.main",
                  },
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                backgroundColor: "primary.main",
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
                allPayouts={allPayouts}
                pendingPayouts={pendingPayouts}
                completedPayouts={completedPayouts}
                totalPayouts={totalPayouts}
                payoutSummary={payoutCounts}
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
                getFinancialAnalysis={getFinancialAnalysis}
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
