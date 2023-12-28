import { Box, SxProps, Theme, styled } from "@mui/material";

interface WrapperProps {
  children: React.ReactNode;
}

export const ColumnWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 5),
  maxWidth: "1024px",
  margin: "auto",
  [theme.breakpoints.down("lg")]: {
    maxWidth: "768px",
  },
  [theme.breakpoints.down("md")]: {
    maxWidth: "600px",
  },
  [theme.breakpoints.down("xs")]: {
    padding: theme.spacing(0),
  },
}));

const wrapperSx: SxProps<Theme> = (theme) => ({
  backgroundColor: theme.palette.background.paper,
  py: theme.spacing(10),
  flexGrow: "1",
  width: "100%",
  [theme.breakpoints.down("xs")]: {
    py: theme.spacing(5),
  },
});

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return <ColumnWrapper sx={wrapperSx}>{children}</ColumnWrapper>;
};

export default Wrapper;
