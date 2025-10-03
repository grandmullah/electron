import React from "react";
import { Box, Typography } from "@mui/material";

interface RevenueBreakdownProps {
  items: Array<{
    label: string;
    value: string;
    color: string;
  }>;
}

export const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({
  items,
}) => {
  return (
    <Box>
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
        Revenue Breakdown
      </Typography>
      <Box mt={1}>
        {items.map((item, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={index < items.length - 1 ? 0.5 : 0}
          >
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontSize: { xs: "0.55rem", sm: "0.6rem", md: "0.65rem" },
              }}
            >
              {item.label}:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{
                color: item.color,
                fontSize: { xs: "0.55rem", sm: "0.6rem", md: "0.65rem" },
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
