import React from "react";
import { Box, Chip } from "@mui/material";

interface StatusChipProps {
  label: string;
  color: string;
  icon?: React.ReactNode;
  variant?: "outlined" | "filled";
  size?: "small" | "medium";
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  color,
  icon,
  variant = "outlined",
  size = "small",
}) => {
  return (
    <Box display="flex" justifyContent="flex-end">
      <Chip
        icon={icon}
        label={label}
        variant={variant}
        size={size}
        sx={{
          color,
          borderColor: color,
          backgroundColor: `${color}20`,
        }}
      />
    </Box>
  );
};
