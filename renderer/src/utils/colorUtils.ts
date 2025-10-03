/**
 * Color utility functions for financial metrics
 */

export const getMetricColor = (value: number, thresholds: { high: number; medium: number } = { high: 1000, medium: 500 }) => {
      if (value > thresholds.high) return "#4caf50"; // Green for high values
      if (value > thresholds.medium) return "#ff9800"; // Orange for medium values
      return "#9e9e9e"; // Gray for low values
};

export const getProfitColor = (amount: number) => {
      if (amount > 0) return "#4caf50"; // Green for profit
      if (amount < 0) return "#f44336"; // Red for loss
      return "#9e9e9e"; // Gray for break-even
};

export const getExpenseColor = (amount: number) => {
      if (amount > 5000) return "#f44336"; // Red for high expenses
      if (amount > 2000) return "#ff9800"; // Orange for medium expenses
      return "#9e9e9e"; // Gray for low expenses
};

export const getTaxColor = (amount: number) => {
      if (amount > 1000) return "#4caf50"; // Green for high tax collection
      if (amount > 500) return "#ff9800"; // Orange for medium tax collection
      return "#9e9e9e"; // Gray for low tax collection
};

export const getStakesColor = (amount: number) => {
      if (amount > 5000) return "#4caf50"; // Green for high stakes
      if (amount > 2000) return "#ff9800"; // Orange for medium stakes
      return "#9e9e9e"; // Gray for low stakes
};

export const getRevenueColor = (amount: number) => {
      if (amount > 10000) return "#4caf50"; // Green for high revenue
      if (amount > 5000) return "#ff9800"; // Orange for medium revenue
      return "#9e9e9e"; // Gray for low revenue
};

export const getGradientColor = (color: string) => {
      const colorMap: Record<string, string> = {
            "#4caf50": "linear-gradient(90deg, #4caf50, #8bc34a)",
            "#ff9800": "linear-gradient(90deg, #ff9800, #ffc107)",
            "#f44336": "linear-gradient(90deg, #f44336, #e91e63)",
            "#2196f3": "linear-gradient(90deg, #2196f3, #21cbf3)",
            "#9e9e9e": "linear-gradient(90deg, #9e9e9e, #bdbdbd)",
      };
      return colorMap[color] || "linear-gradient(90deg, #9e9e9e, #bdbdbd)";
};
