import { getMetricIcon, getTrendIcon } from "../utils/iconUtils";
import { getMetricColor, getProfitColor, getExpenseColor, getTaxColor, getStakesColor, getRevenueColor, getGradientColor } from "../utils/colorUtils";
import { getStatusLabel } from "../utils/statusUtils";

/**
 * Configuration objects for financial cards
 */

export interface FinancialCardConfig {
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      iconColor: string;
      topBorderColor: string;
      getColor: (value: number) => string;
      getStatusLabel: (value: number) => string;
      getIcon: (value: number) => React.ReactNode;
      getStatusIcon: () => React.ReactNode;
}

export const createTaxRevenueConfig = (): FinancialCardConfig => ({
      title: "💰 Tax Revenue",
      subtitle: "Tax collection and revenue metrics",
      icon: getMetricIcon("tax", 28),
      iconColor: "#2196f3",
      topBorderColor: "linear-gradient(90deg, #2196f3, #21cbf3)",
      getColor: getTaxColor,
      getStatusLabel: (value: number) => getStatusLabel(value, "tax"),
      getIcon: (value: number) => getTrendIcon(value, 20),
      getStatusIcon: () => getMetricIcon("tax", 16),
});

export const createStakesCollectedConfig = (): FinancialCardConfig => ({
      title: "🏦 Stakes Collected",
      subtitle: "Stake collection and retention metrics",
      icon: getMetricIcon("stakes", 28),
      iconColor: "#4caf50",
      topBorderColor: "linear-gradient(90deg, #4caf50, #8bc34a)",
      getColor: getStakesColor,
      getStatusLabel: (value: number) => getStatusLabel(value, "stakes"),
      getIcon: (value: number) => getTrendIcon(value, 20),
      getStatusIcon: () => getMetricIcon("stakes", 16),
});

export const createTotalRevenueConfig = (): FinancialCardConfig => ({
      title: "📈 Total Revenue",
      subtitle: "Combined revenue from stakes and tax",
      icon: getMetricIcon("revenue", 28),
      iconColor: "#ff9800",
      topBorderColor: "linear-gradient(90deg, #ff9800, #ffc107)",
      getColor: getRevenueColor,
      getStatusLabel: (value: number) => getStatusLabel(value, "revenue"),
      getIcon: (value: number) => getTrendIcon(value, 20),
      getStatusIcon: () => getMetricIcon("revenue", 16),
});

export const createExpensesConfig = (): FinancialCardConfig => ({
      title: "💸 Expenses",
      subtitle: "Payout expenses and winnings paid",
      icon: getMetricIcon("expense", 28),
      iconColor: "#f44336",
      topBorderColor: "linear-gradient(90deg, #f44336, #e91e63)",
      getColor: getExpenseColor,
      getStatusLabel: (value: number) => getStatusLabel(value, "expense"),
      getIcon: (value: number) => getTrendIcon(value, 20),
      getStatusIcon: () => getMetricIcon("expense", 16),
});

export const createNetProfitConfig = (): FinancialCardConfig => ({
      title: "💎 Net Profit",
      subtitle: "Profitability and margin analysis",
      icon: getMetricIcon("profit", 28),
      iconColor: "#4caf50", // Default, will be overridden based on profit value
      topBorderColor: "linear-gradient(90deg, #4caf50, #8bc34a)", // Default, will be overridden
      getColor: getProfitColor,
      getStatusLabel: (value: number) => getStatusLabel(value, "profit"),
      getIcon: (value: number) => getTrendIcon(value, 20),
      getStatusIcon: () => getMetricIcon("profit", 16),
});

export const getNetProfitConfig = (netProfit: number): FinancialCardConfig => {
      const color = getProfitColor(netProfit);
      return {
            title: "💎 Net Profit",
            subtitle: "Profitability and margin analysis",
            icon: getMetricIcon("profit", 28),
            iconColor: color,
            topBorderColor: getGradientColor(color),
            getColor: getProfitColor,
            getStatusLabel: (value: number) => getStatusLabel(value, "profit"),
            getIcon: (value: number) => getTrendIcon(value, 20),
            getStatusIcon: () => getMetricIcon("profit", 16),
      };
};

export const createPerformanceConfig = (): FinancialCardConfig => ({
      title: "📊 Performance",
      subtitle: "Betting performance and statistics",
      icon: getMetricIcon("revenue", 28),
      iconColor: "#9c27b0",
      topBorderColor: "linear-gradient(90deg, #9c27b0, #e91e63)",
      getColor: (value: number) => {
            if (value > 100) return "#4caf50";
            if (value > 50) return "#ff9800";
            return "#9e9e9e";
      },
      getStatusLabel: (value: number) => getStatusLabel(value, "revenue"),
      getIcon: (value: number) => getTrendIcon(value, 20),
      getStatusIcon: () => getMetricIcon("revenue", 16),
});
