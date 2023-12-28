import { Box, Grid, Link, SxProps, Theme, styled } from "@mui/material";
import React from "react";
import { ColumnWrapper } from "./Wrapper";

interface LinkProp {
  href: string;
  label: string;
}

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(6),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
  },
}));

const linkSx: SxProps<Theme> = (theme) => ({
  color: theme.palette.primary.contrastText,
  textDecorationColor: theme.palette.primary.contrastText,
});

const links: LinkProp[] = [
  {
    label: "GitHub",
    href: "https://github.com/michalpazur/welcome-back-generator",
  },
  { label: "Twitter", href: "https://twitter.com/michalpazur" },
];

const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <ColumnWrapper>
        <Grid container spacing={3}>
          {links.map((l) => (
            <Grid item key={l.label}>
              <Link sx={linkSx} href={l.href} target="_blank" underline="hover">
                {l.label}
              </Link>
            </Grid>
          ))}
        </Grid>
      </ColumnWrapper>
    </FooterWrapper>
  );
};

export default Footer;
