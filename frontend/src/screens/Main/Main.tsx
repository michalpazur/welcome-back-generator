import { Typography, TypographyVariant } from "@mui/material";
import React from "react";
const hello = import.meta.env.VITE_HELLO_WORLD;

const variants: TypographyVariant[] = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "body1",
];

const Main: React.FC = () => {
  return (
    <React.Fragment>
      <Typography variant="h1">{hello}</Typography>
      {variants.map((v) => (
        <Typography variant={v} key={v}>
          Hello {v}!
        </Typography>
      ))}
    </React.Fragment>
  );
};

export default Main;
