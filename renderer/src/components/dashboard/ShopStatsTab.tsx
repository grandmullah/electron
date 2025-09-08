import React from "react";
import { StatCard } from "./shared/StatCard";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { EmptyState } from "./shared/EmptyState";
import {
  ShopStatistics,
  DashboardStatistics,
} from "../../services/statisticsService";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import {
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  ShowChart as ChartIcon,
  AccountBalanceWallet as WalletIcon,
  Star as StarIcon,
} from "@mui/icons-material";

interface ShopStatsTabProps {
  shopStats: ShopStatistics | null;
  dashboardStats: DashboardStatistics | null;
  isLoadingStats: boolean;
  statsError: string | null;
  onRetry: () => void;
  userShop?: any;
}

export const ShopStatsTab: React.FC<ShopStatsTabProps> = ({
  shopStats,
  dashboardStats,
  isLoadingStats,
  statsError,
  onRetry,
  userShop,
}) => {
  if (isLoadingStats) {
    return <LoadingState message="Loading shop statistics..." />;
  }

  if (statsError) {
    return (
      <ErrorState
        title="Error Loading Shop Data"
        message={statsError}
        onRetry={onRetry}
      />
    );
  }

  if (!shopStats && !dashboardStats?.shop) {
    return (
      <EmptyState
        icon="🏪"
        title="No Shop Data"
        message="Unable to load shop statistics. Please try refreshing."
      />
    );
  }

  return (
    <Box>
      {/* Shop Information Display */}
      {userShop && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <StoreIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Shop Information
              </Typography>
              <Typography color="text.secondary">
                Your current shop details
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Shop Name
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {userShop.shop_name}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Shop Code
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {userShop.shop_code}
                </Typography>
              </Box>
            </Grid>
            {userShop.shop_address && (
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Address
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {userShop.shop_address}
                  </Typography>
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Default Currency
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {userShop.default_currency}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Commission Rate
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {userShop.commission_rate}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Shop Statistics Dashboard */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              Shop Performance Overview
            </Typography>
            <Typography color="text.secondary">
              Complete shop betting activity and statistics
            </Typography>
          </Box>
        </Box>

        {/* Shop Performance Row */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <AssessmentIcon color="primary" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Bets
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {shopStats?.totalBets ||
                        dashboardStats?.shop?.totalBets ||
                        0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <MoneyIcon color="primary" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Stake
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      SSP{" "}
                      {(
                        shopStats?.totalStake ||
                        dashboardStats?.shop?.totalStake ||
                        0
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <StarIcon color="primary" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Winnings
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      SSP{" "}
                      {(
                        shopStats?.totalWinnings ||
                        dashboardStats?.shop?.totalWinnings ||
                        0
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <WalletIcon color="primary" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Net Profit
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={
                        (shopStats?.netProfit ||
                          dashboardStats?.shop?.netProfit ||
                          0) >= 0
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      SSP{" "}
                      {(
                        shopStats?.netProfit ||
                        dashboardStats?.shop?.netProfit ||
                        0
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <PeopleIcon color="primary" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Active Users
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {shopStats?.activeUsers ||
                        dashboardStats?.shop?.activeUsers ||
                        0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ChartIcon color="primary" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Avg Bet Size
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      SSP{" "}
                      {(
                        shopStats?.averageBetSize ||
                        dashboardStats?.shop?.averageBetSize ||
                        0
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
