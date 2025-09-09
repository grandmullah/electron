import React from "react";
import { StatCard } from "./shared/StatCard";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { EmptyState } from "./shared/EmptyState";
import {
  PersonalStatistics,
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
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  EmojiEvents as TrophyIcon,
  ShowChart as ChartIcon,
  AccountBalanceWallet as WalletIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
} from "@mui/icons-material";

interface UserStatsTabProps {
  personalStats: PersonalStatistics | null;
  dashboardStats: DashboardStatistics | null;
  isLoadingStats: boolean;
  statsError: string | null;
  onRetry: () => void;
}

export const UserStatsTab: React.FC<UserStatsTabProps> = ({
  personalStats,
  dashboardStats,
  isLoadingStats,
  statsError,
  onRetry,
}) => {
  if (isLoadingStats) {
    return <LoadingState message="Loading user statistics..." />;
  }

  if (statsError) {
    return (
      <ErrorState
        title="Error Loading User Data"
        message={statsError}
        onRetry={onRetry}
      />
    );
  }

  if (!personalStats && !dashboardStats) {
    return (
      <EmptyState
        icon="👤"
        title="No User Data"
        message="Unable to load user statistics. Please try refreshing."
      />
    );
  }

  return (
    <Box>
      {/* Section Header */}
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
        <Box display="flex" alignItems="center" gap={2}>
          <BarChartIcon sx={{ fontSize: 32, color: "#667eea" }} />
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              Your Betting Statistics
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              Overview of your personal betting performance
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Statistics Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                  }}
                >
                  <AssessmentIcon />
                </Box>
                <Box>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                    gutterBottom
                    variant="body2"
                    fontWeight={500}
                  >
                    Total Bets
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ color: "#667eea" }}
                  >
                    {personalStats?.totalBets ||
                      dashboardStats?.personal?.totalBets ||
                      0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                    color: "white",
                  }}
                >
                  <MoneyIcon />
                </Box>
                <Box>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                    gutterBottom
                    variant="body2"
                    fontWeight={500}
                  >
                    Total Stake
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="success.main"
                  >
                    SSP{" "}
                    {(
                      personalStats?.totalStake ||
                      dashboardStats?.personal?.totalStake ||
                      0
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                    color: "white",
                  }}
                >
                  <TrophyIcon />
                </Box>
                <Box>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                    gutterBottom
                    variant="body2"
                    fontWeight={500}
                  >
                    Total Winnings
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    SSP{" "}
                    {(
                      personalStats?.totalWinnings ||
                      dashboardStats?.personal?.totalWinnings ||
                      0
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, #1a1d29 0%, #2d3748 50%, #4a5568 100%)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
                    color: "white",
                  }}
                >
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                    gutterBottom
                    variant="body2"
                    fontWeight={500}
                  >
                    Win Rate
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="secondary.main"
                  >
                    {(
                      personalStats?.winRate ||
                      dashboardStats?.personal?.winRate ||
                      0
                    ).toFixed(1)}
                    %
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Secondary Statistics Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ChartIcon color="primary" />
                <Box>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                    gutterBottom
                  >
                    Avg Odds
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {(
                      personalStats?.averageOdds ||
                      dashboardStats?.personal?.averageOdds ||
                      0
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
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
                    variant="h5"
                    fontWeight="bold"
                    color={
                      (personalStats?.netProfit ||
                        dashboardStats?.personal?.netProfit ||
                        0) >= 0
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    SSP{" "}
                    {(
                      personalStats?.netProfit ||
                      dashboardStats?.personal?.netProfit ||
                      0
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AssessmentIcon color="primary" />
                <Box>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                    gutterBottom
                  >
                    Avg Stake
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    SSP{" "}
                    {(
                      personalStats?.averageStake ||
                      dashboardStats?.personal?.averageStake ||
                      0
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <StarIcon color="primary" />
                <Box>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                    gutterBottom
                  >
                    Best Win
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    SSP{" "}
                    {(
                      personalStats?.bestWin ||
                      dashboardStats?.personal?.bestWin ||
                      0
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Bet Breakdown */}
      <Paper
        sx={{
          p: 4,
          background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <AssessmentIcon />
          </Box>
          <Typography variant="h5" fontWeight="bold">
            Bet Breakdown
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4} md={2}>
            <Card
              sx={{
                textAlign: "center",
                p: 2,
                background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                border: "1px solid #90CAF9",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary.main"
                gutterBottom
              >
                {personalStats?.betBreakdown?.singleBets ||
                  dashboardStats?.personal?.betBreakdown?.singleBets ||
                  0}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)" }}
                variant="body2"
                fontWeight={500}
              >
                Single Bets
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card
              sx={{
                textAlign: "center",
                p: 2,
                background: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
                border: "1px solid #CE93D8",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color="secondary.main"
                gutterBottom
              >
                {personalStats?.betBreakdown?.multibets ||
                  dashboardStats?.personal?.betBreakdown?.multibets ||
                  0}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)" }}
                variant="body2"
                fontWeight={500}
              >
                Multibets
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card
              sx={{
                textAlign: "center",
                p: 2,
                background: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
                border: "1px solid #FFB74D",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color="warning.main"
                gutterBottom
              >
                {personalStats?.betBreakdown?.pending ||
                  dashboardStats?.personal?.betBreakdown?.pending ||
                  0}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)" }}
                variant="body2"
                fontWeight={500}
              >
                Pending
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card
              sx={{
                textAlign: "center",
                p: 2,
                background: "linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)",
                border: "1px solid #A5D6A7",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color="success.main"
                gutterBottom
              >
                {personalStats?.betBreakdown?.settled ||
                  dashboardStats?.personal?.betBreakdown?.settled ||
                  0}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)" }}
                variant="body2"
                fontWeight={500}
              >
                Settled
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card
              sx={{
                textAlign: "center",
                p: 2,
                background: "linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)",
                border: "1px solid #81C784",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color="success.main"
                gutterBottom
              >
                {personalStats?.betBreakdown?.won ||
                  dashboardStats?.personal?.betBreakdown?.won ||
                  0}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)" }}
                variant="body2"
                fontWeight={500}
              >
                Won
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card
              sx={{
                textAlign: "center",
                p: 2,
                background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
                border: "1px solid #EF9A9A",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color="error.main"
                gutterBottom
              >
                {personalStats?.betBreakdown?.lost ||
                  dashboardStats?.personal?.betBreakdown?.lost ||
                  0}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)" }}
                variant="body2"
                fontWeight={500}
              >
                Lost
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
