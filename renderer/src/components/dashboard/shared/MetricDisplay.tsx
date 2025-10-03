import React from "react";
import { Typography, Box } from "@mui/material";

interface MetricDisplayProps {
  label: string;
  value: string | number;
  color?: string;
  variant?: "h4" | "h6" | "body1" | "body2";
  description?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  color = "#ffffff",
  variant = "h4",
  description,
  icon,
  showIcon = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "h4":
        return {
          fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
          fontWeight: "bold",
        };
      case "h6":
        return {
          fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
          fontWeight: "bold",
        };
      case "body1":
        return {
          fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
          fontWeight: 500,
        };
      case "body2":
        return {
          fontSize: { xs: "0.55rem", sm: "0.6rem", md: "0.65rem" },
          fontWeight: 500,
        };
      default:
        return {
          fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
          fontWeight: "bold",
        };
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {showIcon && icon && (
          <Box
            sx={{
              color,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontWeight: 600,
            fontSize: { xs: "0.5rem", sm: "0.55rem", md: "0.6rem" },
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant={variant}
        fontWeight="bold"
        sx={{
          color,
          ...getVariantStyles(),
        }}
      >
        {value}
      </Typography>
      {description && (
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: { xs: "0.45rem", sm: "0.5rem", md: "0.55rem" },
            lineHeight: 1.2,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};
