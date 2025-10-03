import React from "react";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  AccountBalance as BankIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";

/**
 * Icon utility functions for financial metrics
 */

export const getTrendIcon = (value: number, size: number = 20) => {
  return value > 0 ? (
    <TrendingUpIcon sx={{ fontSize: size }} />
  ) : (
    <TrendingDownIcon sx={{ fontSize: size }} />
  );
};

export const getMetricIcon = (
  type: "revenue" | "expense" | "profit" | "tax" | "stakes",
  size: number = 20
) => {
  switch (type) {
    case "revenue":
      return <BankIcon sx={{ fontSize: size }} />;
    case "expense":
      return <MoneyIcon sx={{ fontSize: size }} />;
    case "profit":
      return <AssessmentIcon sx={{ fontSize: size }} />;
    case "tax":
      return <ReceiptIcon sx={{ fontSize: size }} />;
    case "stakes":
      return <BankIcon sx={{ fontSize: size }} />;
    default:
      return <AssessmentIcon sx={{ fontSize: size }} />;
  }
};

export const getStatusIcon = (
  type: "revenue" | "expense" | "profit" | "tax" | "stakes",
  size: number = 16
) => {
  return getMetricIcon(type, size);
};
