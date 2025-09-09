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
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background:
              "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <StoreIcon sx={{ fontSize: 32, color: "#667eea" }} />
            <Box>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                Shop Information
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                Your current shop details
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                  variant="body2"
                  gutterBottom
                >
                  Shop Name
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {userShop.shop_name}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                  variant="body2"
                  gutterBottom
                >
                  Shop Code
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {userShop.shop_code}
                </Typography>
              </Box>
            </Grid>
            {userShop.shop_address && (
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                    variant="body2"
                    gutterBottom
                  >
                    Address
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {userShop.shop_address}
                  </Typography>
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                  variant="body2"
                  gutterBottom
                >
                  Default Currency
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {userShop.default_currency}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                  variant="body2"
                  gutterBottom
                >
                  Commission Rate
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
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
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              Shop Performance Overview
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
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
                    <Typography
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                      gutterBottom
                    >
                      Total Bets
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#667eea" }}
                    >
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
                    <Typography
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                      gutterBottom
                    >
                      Total Stake
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#667eea" }}
                    >
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
                    <Typography
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                      gutterBottom
                    >
                      Total Winnings
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#667eea" }}
                    >
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
                    <Typography
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                      gutterBottom
                    >
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
                    <Typography
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                      gutterBottom
                    >
                      Active Users
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#667eea" }}
                    >
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
                    <Typography
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                      gutterBottom
                    >
                      Avg Bet Size
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#667eea" }}
                    >
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
