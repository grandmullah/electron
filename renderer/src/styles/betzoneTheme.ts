import { createTheme, alpha } from "@mui/material/styles";
import { betzoneColors, betzoneGradients } from "./betzoneTokens";

export const betzoneTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: betzoneColors.brand.midBlue,
      dark: betzoneColors.brand.darkBlue,
      light: betzoneColors.brand.lightBlue,
      contrastText: betzoneColors.text.text5,
    },
    secondary: {
      main: betzoneColors.brand.orange,
      light: betzoneColors.brand.gradient.start,
      dark: betzoneColors.brand.gradient.end,
      contrastText: betzoneColors.background.black,
    },
    success: {
      main: betzoneColors.interface.success,
    },
    warning: {
      main: betzoneColors.interface.attention,
    },
    error: {
      main: betzoneColors.interface.error,
    },
    background: {
      default: betzoneColors.background.black,
      paper: betzoneColors.background.bg1,
    },
    text: {
      primary: betzoneColors.text.text5,
      secondary: betzoneColors.text.text3,
      disabled: betzoneColors.text.text2,
    },
    divider: betzoneColors.borders.border1,
    action: {
      hover: alpha(betzoneColors.text.text5, 0.06),
      selected: alpha(betzoneColors.brand.midBlue, 0.16),
    },
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",

    // Map RN typography scale into MUI defaults
    h1: { fontSize: "24px", lineHeight: "24px", letterSpacing: "-0.5px", fontWeight: 700 },
    h2: { fontSize: "20px", lineHeight: "20px", letterSpacing: "-0.3px", fontWeight: 600 },
    h3: { fontSize: "16px", lineHeight: "20px", letterSpacing: "-0.3px", fontWeight: 600 },
    h4: { fontSize: "14px", lineHeight: "16px", letterSpacing: "-0.4px", fontWeight: 600 },
    h5: { fontSize: "12px", lineHeight: "14px", letterSpacing: "-0.4px", fontWeight: 600 },
    h6: { fontSize: "11px", lineHeight: "14px", letterSpacing: "-0.3px", fontWeight: 600 },

    body1: { fontSize: "14px", lineHeight: "16px", letterSpacing: "-0.4px", fontWeight: 400 },
    body2: { fontSize: "12px", lineHeight: "14px", letterSpacing: "-0.4px", fontWeight: 400 },
    caption: { fontSize: "11px", lineHeight: "14px", letterSpacing: "-0.3px", fontWeight: 400 },
    overline: { fontSize: "10px", lineHeight: "10px", letterSpacing: "0px", fontWeight: 600, textTransform: "uppercase" },

    button: { fontSize: "14px", lineHeight: "16px", letterSpacing: "-0.4px", fontWeight: 600, textTransform: "none" },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: betzoneGradients.appBackground,
          color: betzoneColors.text.text5,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${alpha(betzoneColors.text.text5, 0.08)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: alpha(betzoneColors.background.bg1, 0.85),
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${alpha(betzoneColors.text.text5, 0.08)}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: "11px",
          color: alpha(betzoneColors.text.text5, 0.7),
          borderBottom: `1px solid ${alpha(betzoneColors.text.text5, 0.12)}`,
        },
        body: {
          borderBottom: `1px solid ${alpha(betzoneColors.text.text5, 0.08)}`,
        },
      },
    },
  },
});

