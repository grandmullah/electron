import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import StatisticsService, {
      DashboardStatistics,
      PersonalStatistics,
      ShopStatistics,
} from '../services/statisticsService';

export const useDashboardData = () => {
      const { user } = useAppSelector((state) => state.auth);

      const [personalStats, setPersonalStats] = useState<PersonalStatistics | null>(null);
      const [shopStats, setShopStats] = useState<ShopStatistics | null>(null);
      const [dashboardStats, setDashboardStats] = useState<DashboardStatistics | null>(null);
      const [isLoadingStats, setIsLoadingStats] = useState(false);
      const [statsError, setStatsError] = useState<string | null>(null);

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

      return {
            personalStats,
            shopStats,
            dashboardStats,
            isLoadingStats,
            statsError,
            loadDashboardData,
      };
};
