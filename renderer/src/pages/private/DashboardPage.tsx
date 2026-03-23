import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import { Header } from "../../components/Header";
import { UserStatsTab } from "../../components/dashboard/UserStatsTab";
import { ShopStatsTab } from "../../components/dashboard/ShopStatsTab";
import { PayoutTab } from "../../components/dashboard/PayoutTab";
import { FinancialTab } from "../../components/dashboard/FinancialTab";
import { BetsTab } from "../../components/dashboard/BetsTab";
import { GovernmentTaxTab } from "../../components/dashboard/GovernmentTaxTab";
import { useDashboardData } from "../../hooks/useDashboardData";
import { usePayoutData } from "../../hooks/usePayoutData";
import {
  useFinancialSummary,
  DEFAULT_FINANCIAL_SUMMARY_DAYS,
} from "../../hooks/useFinancialSummary";
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
  Chip,
  LinearProgress,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import {
  Person as PersonIcon,
  Store as StoreIcon,
  AttachMoney as MoneyIcon,
  SportsEsports as BetsIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as GovernmentIcon,
} from "@mui/icons-material";

interface NavigationParams {
  tab?: string;
  [key: string]: any;
}

interface DashboardPageProps {
  onNavigate: (
    page:
      | "home"
      | "dashboard"
      | "settings"
      | "games"
      | "agent"
      | "history"
      | "management",
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
    "user" | "shop" | "payout" | "financial" | "bets" | "governmentTax"
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
    pagination: payoutPagination,
    statusFilter: payoutStatusFilter,
    setStatusFilter: setPayoutStatusFilter,
  } = usePayoutData();

  const {
    recentBets,
    isLoadingBets,
    betsError,
    loadRecentBets,
    currentPage: betsCurrentPage,
    pageSize: betsPageSize,
    pagination: betsPagination,
    statusFilter: betsStatusFilter,
  } = useBetsData();

  const [financialRange, setFinancialRange] = useState<number>(
    DEFAULT_FINANCIAL_SUMMARY_DAYS
  );

  const {
    financialSummary,
    periodSummaries,
    isLoadingFinancialSummary,
    isLoadingPeriods,
    financialSummaryError,
    periodsError,
    loadFinancialSummary,
    loadFinancialSummaryForPeriods,
    formatCurrency: formatFinancialCurrency,
    getProfitMarginColor,
    getWinRateColor,
    getFinancialAnalysis,
  } = useFinancialSummary();
  const formatCurrency = useCallback((amount: number) => `SSP ${(amount || 0).toFixed(2)}`, []);

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (activeTab === "payout") {
      loadPendingPayouts();
    } else if (activeTab === "financial") {
      loadFinancialSummaryForPeriods();
      loadFinancialSummary(financialRange);
    } else if (activeTab === "bets") {
      loadRecentBets();
    }
  }, [
    activeTab,
    financialRange,
    loadPendingPayouts,
    loadFinancialSummary,
    loadFinancialSummaryForPeriods,
    loadRecentBets,
  ]);

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
    const tabs = [
      "user",
      "shop",
      "payout",
      "financial",
      "bets",
      "governmentTax",
    ];
    setActiveTab(
      tabs[newValue] as
        | "user"
        | "shop"
        | "payout"
        | "financial"
        | "bets"
        | "governmentTax"
    );
  };

  const handleFinancialRangeChange = useCallback(
    (days: number) => {
      setFinancialRange(days);
    },
    []
  );

  const getTabIndex = (tab: string) => {
    const tabs = [
      "user",
      "shop",
      "payout",
      "financial",
      "bets",
      "governmentTax",
    ];
    return tabs.indexOf(tab);
  };

  const tabMeta = useMemo(
    () => ({
      user: { label: "User Statistics", color: "primary.main" },
      shop: { label: "Shop Analytics", color: "info.main" },
      payout: { label: "Payout Management", color: "warning.main" },
      financial: { label: "Financial Analytics", color: "success.main" },
      bets: { label: "Recent Bets", color: "secondary.main" },
      governmentTax: { label: "Government Tax", color: "error.main" },
    }),
    []
  );

  const headerMetrics = useMemo(() => {
    const summary = dashboardStats?.summary;
    return [
      {
        key: "totalBets",
        label: "Total Bets",
        value: summary?.totalBets ?? personalStats?.totalBets ?? 0,
        tone: "default" as const,
      },
      {
        key: "totalStake",
        label: "Total Stake",
        value: formatCurrency(summary?.totalStake ?? personalStats?.totalStake ?? 0),
        tone: "default" as const,
      },
      {
        key: "netProfit",
        label: "Net Profit",
        value: formatCurrency(summary?.netProfit ?? personalStats?.netProfit ?? 0),
        tone: (summary?.netProfit ?? personalStats?.netProfit ?? 0) >= 0 ? "success" as const : "error" as const,
      },
      {
        key: "pendingPayouts",
        label: "Pending Payouts",
        value: totalPayouts ?? 0,
        tone: totalPayouts > 0 ? ("warning" as const) : ("default" as const),
      },
    ];
  }, [dashboardStats, personalStats, totalPayouts, formatCurrency]);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        position: "relative",
        color: "text.primary",
      }}
    >
      <Header onNavigate={onNavigate} currentPage="dashboard" />

      <Container
        maxWidth="xl"
        sx={{ py: { xs: 2, md: 3 }, position: "relative", zIndex: 1 }}
      >
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, md: 2.5 },
            mb: 2,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1.5}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Optimized workspace for analytics, payouts, and tax workflows.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                size="small"
                label={`Active: ${tabMeta[activeTab].label}`}
                sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
              />
              <Chip
                size="small"
                label={user?.shop?.shop_name ? `Shop: ${user.shop.shop_name}` : "No shop linked"}
                sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
              />
            </Stack>
          </Stack>
          {isLoadingStats && <LinearProgress sx={{ mt: 1.5 }} />}
        </Paper>

        <Grid container spacing={1.25} sx={{ mb: 2 }}>
          {headerMetrics.map((metric) => (
            <Grid item xs={12} sm={6} lg={3} key={metric.key}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.08)",
                  bgcolor: "rgba(255,255,255,0.02)",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {metric.label}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color:
                      metric.tone === "success"
                        ? "success.main"
                        : metric.tone === "error"
                        ? "error.main"
                        : metric.tone === "warning"
                        ? "warning.main"
                        : "text.primary",
                  }}
                >
                  {metric.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

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
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: { xs: 52, md: 56 },
                minWidth: { xs: 120, md: 140 },
                px: { xs: 1.25, md: 1.75 },
                fontSize: { xs: "0.8rem", md: "0.9rem" },
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
              "& .MuiTab-iconWrapper": {
                mr: { xs: 0.5, md: 0.75 },
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
            <Tab
              icon={<GovernmentIcon />}
              label="Government Tax"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Fade in={true} timeout={250}>
          <Box sx={{ mt: 1 }}>
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
                pagination={payoutPagination}
                statusFilter={payoutStatusFilter}
                onStatusFilterChange={setPayoutStatusFilter}
                onLoadPage={loadPendingPayouts}
                onNavigate={
                  onNavigate as (
                    page:
                      | "home"
                      | "dashboard"
                      | "settings"
                      | "games"
                      | "agent"
                      | "history"
                      | "management",
                    params?: NavigationParams
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
                isLoadingPeriods={isLoadingPeriods}
                periodsError={periodsError}
                onRetry={() => {
                  loadFinancialSummary(financialRange);
                  loadFinancialSummaryForPeriods();
                }}
                formatCurrency={formatFinancialCurrency}
                getProfitMarginColor={getProfitMarginColor}
                getWinRateColor={getWinRateColor}
                getFinancialAnalysis={getFinancialAnalysis}
                selectedRange={financialRange}
                onRangeChange={handleFinancialRangeChange}
              />
            )}

            {activeTab === "bets" && (
              <BetsTab
                recentBets={recentBets}
                isLoadingBets={isLoadingBets}
                betsError={betsError}
                onLoadRecentBets={loadRecentBets}
                currentPage={betsCurrentPage}
                pageSize={betsPageSize}
                pagination={betsPagination}
                statusFilter={betsStatusFilter}
              />
            )}

            {activeTab === "governmentTax" && (
              <GovernmentTaxTab formatCurrency={formatCurrency} />
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};
