import React from "react";
import { Paper, Typography, Box, Stack } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

interface MetricCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  topBorderColor: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  topBorderColor,
  children,
  sx = {},
}) => {
  return (
    <Paper
      sx={{
        p: { xs: 1, sm: 1.25, md: 1.5 },
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 4,
        boxShadow:
          "0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        color: "white",
        position: "relative",
        height: "100%",
        minHeight: { xs: "280px", sm: "300px", md: "320px" },
        display: "flex",
        flexDirection: "column",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: topBorderColor,
          borderRadius: "4px 4px 0 0",
        },
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4)",
          border: `1px solid ${iconColor}40`,
        },
        ...sx,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        mb={1.5}
        sx={{ flexShrink: 0 }}
      >
        <Box
          sx={{
            p: { xs: 0.5, sm: 0.75, md: 1 },
            borderRadius: 2,
            background: `${iconColor}20`,
            border: `1px solid ${iconColor}40`,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Stack
        spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
        sx={{ flex: 1, justifyContent: "space-between" }}
      >
        {children}
      </Stack>
    </Paper>
  );
};
