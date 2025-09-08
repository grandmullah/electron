import React from "react";
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  /** Put your mantine theme override here */
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  headings: {
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  colors: {
    // Custom color palette for the betting app
    brand: [
      "#e7f5ff",
      "#d0ebff",
      "#a5d8ff",
      "#74c0fc",
      "#339af0",
      "#228be6",
      "#1c7ed6",
      "#1971c2",
      "#1864ab",
      "#0c4a6e",
    ],
    success: [
      "#f0fff4",
      "#dcfce7",
      "#bbf7d0",
      "#86efac",
      "#4ade80",
      "#22c55e",
      "#16a34a",
      "#15803d",
      "#166534",
      "#14532d",
    ],
    warning: [
      "#fffbeb",
      "#fef3c7",
      "#fde68a",
      "#fcd34d",
      "#fbbf24",
      "#f59e0b",
      "#d97706",
      "#b45309",
      "#92400e",
      "#78350f",
    ],
    error: [
      "#fef2f2",
      "#fee2e2",
      "#fecaca",
      "#fca5a5",
      "#f87171",
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
    ],
  },
  components: {
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
        withTableBorder: true,
        withColumnBorders: true,
      },
      styles: {
        root: {
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        header: {
          backgroundColor: "var(--mantine-color-gray-1)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
        row: {
          "&:hover": {
            backgroundColor: "var(--mantine-color-gray-0)",
            transform: "translateY(-1px)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s ease",
          },
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    DateInput: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});

interface MantineProviderProps {
  children: React.ReactNode;
}

export const MantineProviderWrapper: React.FC<MantineProviderProps> = ({
  children,
}) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
};
