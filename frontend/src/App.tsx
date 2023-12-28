import { Box, CssBaseline, ThemeProvider, styled } from "@mui/material";
import React from "react";
import Main from "./screens/Main";
import { theme } from "./theme";
import Footer from "./components/Footer";

const PageRoot = styled(Box)({
  display: "flex",
  flexDirection: "column",
  minHeight: ["100vh", "100dvh"],
});

const Root = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flexGrow: "1",
  backgroundColor: theme.palette.grey[200],
  padding: theme.spacing(0, 6),
  [theme.breakpoints.down("xs")]: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0, 4),
  },
}));

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageRoot>
        <Root>
          <Main />
        </Root>
        <Footer />
      </PageRoot>
    </ThemeProvider>
  );
};

export default App;
