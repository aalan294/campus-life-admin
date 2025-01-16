import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import DashboardLayout from "./components/DashboardLayout";
import theme from "./theme";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <DashboardLayout />
    </ThemeProvider>
  );
};

export default App;
