import { createTheme, responsiveFontSizes } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xxs: true;
  }
  type Breakpoint = "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
}

let theme = createTheme({
  spacing: 4,
  shape: {
    borderRadius: 6,
  },
  breakpoints: {
    values: {
      xxs: 0,
      xs: 475,
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1440,
    },
  },
  palette: {
    primary: {
      main: "#0072E5",
    },
    text: {
      primary: "#170225",
    },
  },
  typography: {
    fontFamily: ["'Work Sans'", "sans-serif"].join(","),
    fontSize: 16,
    h1: {
      fontSize: 48,
      fontWeight: "bold",
      lineHeight: 58 / 48,
    },
    h2: {
      fontSize: 32,
      fontWeight: "bold",
      lineHeight: 42 / 32,
    },
    h3: {
      fontSize: 24,
      fontWeight: "bold",
      lineHeight: 34 / 24,
    },
    h4: {
      fontSize: 24,
      lineHeight: 34 / 24,
    },
    h5: {
      fontSize: 20,
      lineHeight: 30 / 20,
    },
    h6: {
      fontSize: 18,
      lineHeight: 28 / 18,
    },
    body1: {
      lineHeight: 22 / 16,
    },
  },
});

theme = responsiveFontSizes(theme);
export { theme };
