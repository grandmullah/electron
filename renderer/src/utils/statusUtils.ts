/**
 * Status utility functions for financial metrics
 */

export const getStatusLabel = (value: number, type: "revenue" | "expense" | "profit" | "tax" | "stakes") => {
      const isActive = value > 0;

      switch (type) {
            case "revenue":
                  return isActive ? "Revenue Generation Active" : "No Revenue Generated";
            case "expense":
                  return isActive ? "Payouts Active" : "No Payouts Made";
            case "profit":
                  if (value > 0) return "Profitable";
                  if (value < 0) return "Loss";
                  return "Break-even";
            case "tax":
                  return isActive ? "Tax Collection Active" : "No Tax Collected";
            case "stakes":
                  return isActive ? "Stakes Collection Active" : "No Stakes Collected";
            default:
                  return isActive ? "Active" : "Inactive";
      }
};

export const getProfitStatus = (amount: number) => {
      if (amount > 0) return "Profitable";
      if (amount < 0) return "Loss";
      return "Break-even";
};
