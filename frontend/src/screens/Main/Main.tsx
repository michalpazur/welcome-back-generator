import { Link, Stack, Typography } from "@mui/material";
import React from "react";
import Wrapper from "../../components/Wrapper";
import Generator from "./components/Generator";

const Main: React.FC = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h1">Welcome back!</Typography>
      <Typography>
        Generate a "Welcome back" meme based on random Wikipedia articles.
      </Typography>
      <Typography variant="h2">Generate</Typography>
      <Generator />
      <Typography>
        This generator has been made possible by{" "}
        <Link href="https://en.wikipedia.org" target="_blank">
          Wikipedia
        </Link>{" "}
        and{" "}
        <Link href="https://wikidata.org" target="_blank">
          Wikidata
        </Link>{" "}
        contributors under{" "}
        <Link
          href="https://en.wikipedia.org/wiki/Wikipedia:Text_of_the_Creative_Commons_Attribution-ShareAlike_4.0_International_License"
          target="_blank"
        >
          CC BY-SA 4.0
        </Link>{" "}
        license.
      </Typography>
    </Stack>
  );
};

const Wrapped: React.FC = () => (
  <Wrapper>
    <Main />
  </Wrapper>
);

export default Wrapped;
