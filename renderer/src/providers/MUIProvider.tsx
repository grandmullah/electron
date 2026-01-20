import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { betzoneTheme } from "../styles/betzoneTheme";

interface MUIProviderProps {
  children: React.ReactNode;
}

export const MUIProviderWrapper: React.FC<MUIProviderProps> = ({
  children,
}) => {
  return (
    <ThemeProvider theme={betzoneTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
