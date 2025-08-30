import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "../../store/hooks";
import { Header } from "../../components/Header";
import StatisticsService, {
  DashboardStatistics,
  PersonalStatistics,
  ShopStatistics,
} from "../../services/statisticsService";
// CSS is now loaded via HTML link tag

interface DashboardPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAppSelector((state) => state.auth);

  // Data state for different statistics
  const [personalStats, setPersonalStats] = useState<PersonalStatistics | null>(
    null
  );
  const [shopStats, setShopStats] = useState<ShopStatistics | null>(null);
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Load all statistics data using multiple API calls
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingStats(true);
    setStatsError(null);

    try {
      console.log("🔄 Loading comprehensive dashboard data for user:", user.id);

      // Get shop ID if user is associated with a shop
      const shopId = user.shop_id || user.shop?.id || undefined;

      // Log shop information for debugging
      console.log("🏪 Shop Information:", {
        shop_id: user.shop_id,
        shop_object: user.shop,
        shop_name: user.shop?.shop_name,
        shop_code: user.shop?.shop_code,
        final_shop_id: shopId,
      });

      // Call all three statistics APIs in parallel for better performance
      const [personalResult, shopResult, dashboardResult] =
        await Promise.allSettled([
          // 1. Personal Statistics API
          StatisticsService.getPersonalStatistics({
            startDate: "2024-01-01", // Last year
            endDate: new Date().toISOString().split("T")[0] || "2024-12-31", // Today with fallback
            betType: "all",
            status: "all",
          }),

          // 2. Shop Statistics API (if user has shop access)
          shopId
            ? StatisticsService.getShopStatistics(shopId, {
                startDate: "2024-01-01",
                endDate: new Date().toISOString().split("T")[0] || "2024-12-31",
              })
            : Promise.resolve(null),

          // 3. Dashboard Statistics API (overview)
          StatisticsService.getDashboardStatistics(shopId),
        ]);

      console.log("✅ All API calls completed");

      // Handle Personal Statistics
      if (personalResult.status === "fulfilled") {
        console.log("✅ Personal statistics loaded:", personalResult.value);
        setPersonalStats(personalResult.value);
      } else {
        console.error("❌ Personal statistics failed:", personalResult.reason);
      }

      // Handle Shop Statistics
      if (shopResult.status === "fulfilled" && shopResult.value) {
        console.log("✅ Shop statistics loaded:", shopResult.value);
        setShopStats(shopResult.value);
      } else if (shopResult.status === "rejected") {
        console.error("❌ Shop statistics failed:", shopResult.reason);
      }

      // Handle Dashboard Statistics
      if (dashboardResult.status === "fulfilled") {
        console.log("✅ Dashboard statistics loaded:", dashboardResult.value);
        setDashboardStats(dashboardResult.value);
      } else {
        console.error(
          "❌ Dashboard statistics failed:",
          dashboardResult.reason
        );
      }

      // Check if we have at least some data
      const hasAnyData =
        personalResult.status === "fulfilled" ||
        (shopResult.status === "fulfilled" && shopResult.value) ||
        dashboardResult.status === "fulfilled";

      if (!hasAnyData) {
        throw new Error(
          "All statistics APIs failed. Please check your connection and try again."
        );
      }
    } catch (error: any) {
      console.error("💥 Error loading dashboard data:", error);

      // Check if it's a network/connection error
      if (
        error.message.includes("fetch") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("Network Error") ||
        error.message.includes("ECONNREFUSED")
      ) {
        setStatsError(
          "Unable to connect to the server. Please ensure the backend is running and try again."
        );
      } else if (error.message.includes("Authentication failed")) {
        setStatsError("Authentication failed. Please log in again.");
      } else {
        setStatsError(error.message || "Failed to load dashboard data");
      }
    } finally {
      setIsLoadingStats(false);
    }
  }, [user?.id, user?.shop_id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div>
      <Header onNavigate={onNavigate} currentPage="dashboard" />

      <div className="dashboard-container">
        {/* Modern Page Header */}
        <div className="page-header-modern">
          <div className="header-content">
            <div className="header-left">
              <h1>📊 Dashboard</h1>
              {/* <p className="subtitle">
                Comprehensive overview of your betting activity and shop
                performance
              </p> */}
            </div>
            {/* <div className="header-right">
              <button
                className="btn btn-primary btn-modern"
                onClick={loadDashboardData}
                disabled={isLoadingStats}
              >
                {isLoadingStats ? (
                  <>
                    <div className="loading-spinner-modern"></div>
                    Refreshing...
                  </>
                ) : (
                  <>🔄 Refresh Data</>
                )}
              </button>
            </div> */}
          </div>
        </div>

        {/* Enhanced Statistics Dashboard */}
        {isLoadingStats ? (
          <div className="loading-state-modern">
            <div className="loading-spinner-modern"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : statsError ? (
          <div className="error-state-modern">
            <div className="error-icon-modern">⚠️</div>
            <h3>Error Loading Dashboard</h3>
            <p>{statsError}</p>
            <button className="btn btn-primary" onClick={loadDashboardData}>
              Try Again
            </button>
          </div>
        ) : personalStats || shopStats || dashboardStats ? (
          <>
            {/* Shop Information Display */}
            {user?.shop && (
              <div className="shop-info-display">
                <div className="section-header-modern">
                  <h2>🏪 Shop Information</h2>
                  <p>Your current shop details</p>
                </div>
                <div className="shop-details-grid">
                  <div className="shop-detail-item">
                    <span className="detail-label">Shop Name:</span>
                    <span className="detail-value">{user.shop.shop_name}</span>
                  </div>
                  <div className="shop-detail-item">
                    <span className="detail-label">Shop Code:</span>
                    <span className="detail-value">{user.shop.shop_code}</span>
                  </div>
                  {user.shop.shop_address && (
                    <div className="shop-detail-item">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">
                        {user.shop.shop_address}
                      </span>
                    </div>
                  )}
                  <div className="shop-detail-item">
                    <span className="detail-label">Default Currency:</span>
                    <span className="detail-value">
                      {user.shop.default_currency}
                    </span>
                  </div>
                  <div className="shop-detail-item">
                    <span className="detail-label">Commission Rate:</span>
                    <span className="detail-value">
                      {user.shop.commission_rate}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* User Statistics Dashboard - Horizontal Layout */}
            <div className="stats-dashboard-modern">
              <div className="section-header-modern">
                <h2>👤 Your Betting Statistics</h2>
                <p>Overview of your personal betting performance</p>
              </div>

              {/* Main Statistics Row */}
              <div className="main-stats-row">
                <div className="main-stat-card">
                  <div className="main-stat-icon">📊</div>
                  <div className="main-stat-content">
                    <h3>Total Bets</h3>
                    <p className="main-stat-value">
                      {personalStats?.totalBets ||
                        dashboardStats?.personal?.totalBets ||
                        0}
                    </p>
                  </div>
                </div>

                <div className="main-stat-card">
                  <div className="main-stat-icon">💰</div>
                  <div className="main-stat-content">
                    <h3>Total Stake</h3>
                    <p className="main-stat-value">
                      SSP{" "}
                      {(
                        personalStats?.totalStake ||
                        dashboardStats?.personal?.totalStake ||
                        0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="main-stat-card">
                  <div className="main-stat-icon">🏆</div>
                  <div className="main-stat-content">
                    <h3>Total Winnings</h3>
                    <p className="main-stat-value">
                      SSP{" "}
                      {(
                        personalStats?.totalWinnings ||
                        dashboardStats?.personal?.totalWinnings ||
                        0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="main-stat-card">
                  <div className="main-stat-icon">📈</div>
                  <div className="main-stat-content">
                    <h3>Win Rate</h3>
                    <p className="main-stat-value">
                      {(
                        personalStats?.winRate ||
                        dashboardStats?.personal?.winRate ||
                        0
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Statistics Row */}
              <div className="secondary-stats-row">
                <div className="secondary-stat-card">
                  <div className="secondary-stat-icon">🎯</div>
                  <div className="secondary-stat-content">
                    <h3>Avg Odds</h3>
                    <p className="secondary-stat-value">
                      {(
                        personalStats?.averageOdds ||
                        dashboardStats?.personal?.averageOdds ||
                        0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="secondary-stat-card">
                  <div className="secondary-stat-icon">💸</div>
                  <div className="secondary-stat-content">
                    <h3>Net Profit</h3>
                    <p
                      className={`secondary-stat-value ${(personalStats?.netProfit || dashboardStats?.personal?.netProfit || 0) >= 0 ? "positive" : "negative"}`}
                    >
                      SSP{" "}
                      {(
                        personalStats?.netProfit ||
                        dashboardStats?.personal?.netProfit ||
                        0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="secondary-stat-card">
                  <div className="secondary-stat-icon">📊</div>
                  <div className="secondary-stat-content">
                    <h3>Avg Stake</h3>
                    <p className="secondary-stat-value">
                      SSP{" "}
                      {(
                        personalStats?.averageStake ||
                        dashboardStats?.personal?.averageStake ||
                        0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="secondary-stat-card">
                  <div className="secondary-stat-icon">🏅</div>
                  <div className="secondary-stat-content">
                    <h3>Best Win</h3>
                    <p className="secondary-stat-value">
                      SSP{" "}
                      {(
                        personalStats?.bestWin ||
                        dashboardStats?.personal?.bestWin ||
                        0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bet Breakdown */}
              <div className="bet-breakdown-modern">
                <h3>📋 Bet Breakdown</h3>
                <div className="breakdown-grid-modern">
                  <div className="breakdown-item-modern">
                    <span className="breakdown-label">Single Bets</span>
                    <span className="breakdown-value">
                      {personalStats?.betBreakdown?.singleBets ||
                        dashboardStats?.personal?.betBreakdown?.singleBets ||
                        0}
                    </span>
                  </div>
                  <div className="breakdown-item-modern">
                    <span className="breakdown-label">Multibets</span>
                    <span className="breakdown-value">
                      {personalStats?.betBreakdown?.multibets ||
                        dashboardStats?.personal?.betBreakdown?.multibets ||
                        0}
                    </span>
                  </div>
                  <div className="breakdown-item-modern">
                    <span className="breakdown-label">Pending</span>
                    <span className="breakdown-value">
                      {personalStats?.betBreakdown?.pending ||
                        dashboardStats?.personal?.betBreakdown?.pending ||
                        0}
                    </span>
                  </div>
                  <div className="breakdown-item-modern">
                    <span className="breakdown-label">Settled</span>
                    <span className="breakdown-value">
                      {personalStats?.betBreakdown?.settled ||
                        dashboardStats?.personal?.betBreakdown?.settled ||
                        0}
                    </span>
                  </div>
                  <div className="breakdown-item-modern">
                    <span className="breakdown-label">Won</span>
                    <span className="breakdown-value positive">
                      {personalStats?.betBreakdown?.won ||
                        dashboardStats?.personal?.betBreakdown?.won ||
                        0}
                    </span>
                  </div>
                  <div className="breakdown-item-modern">
                    <span className="breakdown-label">Lost</span>
                    <span className="breakdown-value negative">
                      {personalStats?.betBreakdown?.lost ||
                        dashboardStats?.personal?.betBreakdown?.lost ||
                        0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Statistics Dashboard */}
            {(shopStats || dashboardStats?.shop) && (
              <div className="stats-dashboard-modern">
                <div className="section-header-modern">
                  <h2>🏪 Shop Performance Overview</h2>
                  <p>Complete shop betting activity and statistics</p>
                </div>

                {/* Shop Info Header */}
                <div className="shop-header-modern">
                  <div className="shop-icon-large">🏪</div>
                  <div className="shop-title-section">
                    <h3 className="shop-name">
                      {shopStats?.shopInfo?.shopName ||
                        dashboardStats?.shop?.shopInfo?.shopName ||
                        "Shop"}
                    </h3>
                    <div className="shop-quick-stats">
                      <span className="quick-stat">
                        <span className="quick-stat-icon">📊</span>
                        {shopStats?.totalBets ||
                          dashboardStats?.shop?.totalBets ||
                          0}{" "}
                        bets
                      </span>
                      <span className="quick-stat">
                        <span className="quick-stat-icon">💰</span>
                        SSP{" "}
                        {(
                          shopStats?.totalStake ||
                          dashboardStats?.shop?.totalStake ||
                          0
                        ).toFixed(0)}
                      </span>
                      <span className="quick-stat">
                        <span className="quick-stat-icon">👥</span>
                        {shopStats?.activeUsers ||
                          dashboardStats?.shop?.activeUsers ||
                          0}{" "}
                        users
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shop Performance Row */}
                <div className="shop-stats-row">
                  <div className="shop-stat-card">
                    <div className="shop-stat-icon">📊</div>
                    <div className="shop-stat-content">
                      <h3>Total Bets</h3>
                      <p className="shop-stat-value">
                        {shopStats?.totalBets ||
                          dashboardStats?.shop?.totalBets ||
                          0}
                      </p>
                    </div>
                  </div>

                  <div className="shop-stat-card">
                    <div className="shop-stat-icon">💰</div>
                    <div className="shop-stat-content">
                      <h3>Total Stake</h3>
                      <p className="shop-stat-value">
                        SSP{" "}
                        {(
                          shopStats?.totalStake ||
                          dashboardStats?.shop?.totalStake ||
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="shop-stat-card">
                    <div className="shop-stat-icon">🏆</div>
                    <div className="shop-stat-content">
                      <h3>Total Winnings</h3>
                      <p className="shop-stat-value">
                        SSP{" "}
                        {(
                          shopStats?.totalWinnings ||
                          dashboardStats?.shop?.totalWinnings ||
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="shop-stat-card">
                    <div className="shop-stat-icon">💸</div>
                    <div className="shop-stat-content">
                      <h3>Net Profit</h3>
                      <p
                        className={`shop-stat-value ${(shopStats?.netProfit || dashboardStats?.shop?.netProfit || 0) >= 0 ? "positive" : "negative"}`}
                      >
                        SSP{" "}
                        {(
                          shopStats?.netProfit ||
                          dashboardStats?.shop?.netProfit ||
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="shop-stat-card">
                    <div className="shop-stat-icon">👥</div>
                    <div className="shop-stat-content">
                      <h3>Active Users</h3>
                      <p className="shop-stat-value">
                        {shopStats?.activeUsers ||
                          dashboardStats?.shop?.activeUsers ||
                          0}
                      </p>
                    </div>
                  </div>

                  <div className="shop-stat-card">
                    <div className="shop-stat-icon">📊</div>
                    <div className="shop-stat-content">
                      <h3>Avg Bet Size</h3>
                      <p className="shop-stat-value">
                        SSP{" "}
                        {(
                          shopStats?.averageBetSize ||
                          dashboardStats?.shop?.averageBetSize ||
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shop Bet Breakdown */}
                <div className="bet-breakdown-modern">
                  <h3>🏪 Shop Bet Breakdown</h3>
                  <div className="breakdown-grid-modern">
                    <div className="breakdown-item-modern">
                      <span className="breakdown-label">Single Bets</span>
                      <span className="breakdown-value">
                        {shopStats?.betBreakdown?.singleBets ||
                          dashboardStats?.shop?.betBreakdown?.singleBets ||
                          0}
                      </span>
                    </div>
                    <div className="breakdown-item-modern">
                      <span className="breakdown-label">Multibets</span>
                      <span className="breakdown-value">
                        {shopStats?.betBreakdown?.multibets ||
                          dashboardStats?.shop?.betBreakdown?.multibets ||
                          0}
                      </span>
                    </div>
                    <div className="breakdown-item-modern">
                      <span className="breakdown-label">Pending</span>
                      <span className="breakdown-value">
                        {shopStats?.betBreakdown?.pending ||
                          dashboardStats?.shop?.betBreakdown?.pending ||
                          0}
                      </span>
                    </div>
                    <div className="breakdown-item-modern">
                      <span className="breakdown-label">Settled</span>
                      <span className="breakdown-value">
                        {shopStats?.betBreakdown?.settled ||
                          dashboardStats?.shop?.betBreakdown?.settled ||
                          0}
                      </span>
                    </div>
                    <div className="breakdown-item-modern">
                      <span className="breakdown-label">Won</span>
                      <span className="breakdown-value positive">
                        {shopStats?.betBreakdown?.won ||
                          dashboardStats?.shop?.betBreakdown?.won ||
                          0}
                      </span>
                    </div>
                    <div className="breakdown-item-modern">
                      <span className="breakdown-label">Lost</span>
                      <span className="breakdown-value negative">
                        {shopStats?.betBreakdown?.lost ||
                          dashboardStats?.shop?.betBreakdown?.lost ||
                          0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Breakdown */}
                {(shopStats?.userBreakdown ||
                  dashboardStats?.shop?.userBreakdown) &&
                  (shopStats?.userBreakdown?.length ||
                    dashboardStats?.shop?.userBreakdown?.length ||
                    0) > 0 && (
                    <div className="user-breakdown-modern">
                      <h3>👥 User Performance Breakdown</h3>
                      <div className="user-breakdown-list-modern">
                        {(
                          shopStats?.userBreakdown ||
                          dashboardStats?.shop?.userBreakdown ||
                          []
                        )
                          .slice(0, 10)
                          .map((user, index) => (
                            <div
                              key={user.userId}
                              className="user-breakdown-item-modern"
                            >
                              <div className="user-rank-modern">
                                #{index + 1}
                              </div>
                              <div className="user-phone-modern">
                                {user.phoneNumber}
                              </div>
                              <div className="user-stats-modern">
                                <span className="user-bets-modern">
                                  {user.totalBets} bets
                                </span>
                                <span className="user-stake-modern">
                                  SSP {user.totalStake.toFixed(2)}
                                </span>
                                <span className="user-winnings-modern">
                                  SSP {user.totalWinnings.toFixed(2)}
                                </span>
                                <span className="user-winrate-modern">
                                  {user.winRate.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions-modern">
              <div className="section-header-modern">
                <h2>⚡ Quick Actions</h2>
                <p>Navigate to different sections of the application</p>
              </div>
              <div className="actions-grid-modern">
                <button
                  className="action-card-modern"
                  onClick={() => onNavigate("games")}
                >
                  <div className="action-icon">🎮</div>
                  <h3>Place New Bet</h3>
                  <p>Browse games and place your next bet</p>
                </button>
                <button
                  className="action-card-modern"
                  onClick={() => onNavigate("history")}
                >
                  <div className="action-icon">📋</div>
                  <h3>View History</h3>
                  <p>Check your complete betting history</p>
                </button>
                <button
                  className="action-card-modern"
                  onClick={() => onNavigate("agent")}
                >
                  <div className="action-icon">👨‍💼</div>
                  <h3>Agent Mode</h3>
                  <p>Switch to agent mode for shop management</p>
                </button>
                <button
                  className="action-card-modern"
                  onClick={() => onNavigate("settings")}
                >
                  <div className="action-icon">⚙️</div>
                  <h3>Settings</h3>
                  <p>Configure your account preferences</p>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state-modern">
            <div className="empty-icon-modern">📊</div>
            <h3>No Dashboard Data</h3>
            <p>Unable to load dashboard statistics. Please try refreshing.</p>

            {/* Basic User Info Fallback */}
            {user && (
              <div className="user-info-fallback">
                <h4>👤 User Information</h4>
                <div className="user-details">
                  <p>
                    <strong>Phone:</strong> {user.phoneNumber}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p>
                    <strong>Balance:</strong> SSP{" "}
                    {user.balance?.toFixed(2) || "0.00"}
                  </p>
                  <p>
                    <strong>Currency:</strong> {user.currency || "SSP"}
                  </p>
                  {user.shop && (
                    <p>
                      <strong>Shop:</strong> {user.shop.shop_name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
