import { CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import Main from "./screens/Main/Main";
import { theme } from "./theme";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Main />
    </ThemeProvider>
  );
};

export default App;
