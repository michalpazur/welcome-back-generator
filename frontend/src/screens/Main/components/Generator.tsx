import { CloseRounded as ErrorIcon } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Fade,
  Grid,
  Link,
  MenuItem,
  Stack,
  SxProps,
  Theme,
  Typography,
  styled,
} from "@mui/material";
import { AxiosError, isAxiosError } from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import TextField from "../../../components/TextField";
import { methods } from "../../../data/methods";
import { useIsMobile } from "../../../util/useIsMobile";
import {
  GenerateResponse,
  useGenerateMutation,
} from "../hooks/useGenerateMutation";

const baseUrl = import.meta.env.VITE_BASE_URL;

const imgContainerSx: SxProps<Theme> = (theme) => ({
  position: "relative",
  width: "100%",
  aspectRatio: "6 / 5",
  maxWidth: "600px",
  backgroundColor: (theme) => theme.palette.secondary.main,
  borderRadius: "6px",
  overflow: "hidden",
  [theme.breakpoints.up("lg")]: {
    width: "600px",
  },
});

const imgSx: SxProps = {
  width: "100%",
  height: "100%",
};

const loaderRoot: SxProps<Theme> = {
  backdropFilter: "blur(6px)",
  position: "absolute",
  inset: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const bold = { fontWeight: "bold" };

const Image = styled("img")();

const WrappedGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box>
    <Grid spacing={3} container>
      {children}
    </Grid>
  </Box>
);

const Generator: React.FC = () => {
  const upLg = !useIsMobile("lg");
  const isMobile = useIsMobile("sm");
  const [value, setValue] = useState("sameYearAfter");
  const [data, setData] = useState<GenerateResponse | undefined>();
  const [imageError, setImageError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timeLeft < 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [timeLeft]);

  const onError = (e: AxiosError) => {
    if (!isAxiosError(e)) return;

    if (e.response?.status === 429) {
      const retryAfter = e.response.headers["retry-after"];
      const parsed = Number.parseInt(retryAfter);
      if (Number.isInteger(parsed)) {
        setTimeLeft(parsed);
        intervalRef.current = setInterval(() => {
          setTimeLeft((t) => t - 1);
        }, 1000);
      }
    }
  };

  const onSuccess = (data: GenerateResponse) => {
    setData(data);
    setImageError(false);
  };

  const { isPending, mutate: generate } = useGenerateMutation({
    onError,
    onSuccess,
  });

  const onGenerateClick = () => {
    if (!isPending) {
      generate({ method: value });
    }
  };

  const onImageError = () => {
    setImageError(true);
  };

  const rateLimitError = useMemo(
    () => (
      <Collapse in={timeLeft > 0}>
        <Alert severity="error">
          <AlertTitle>Too many requests!</AlertTitle>
          Try again in <span style={bold}>{timeLeft}</span> second
          {timeLeft !== 1 ? "s" : ""}.
        </Alert>
      </Collapse>
    ),
    [timeLeft]
  );

  const imageContainer = useMemo(
    () => (
      <Box sx={imgContainerSx}>
        {data && !imageError && (
          <Image
            sx={imgSx}
            src={`${baseUrl}/image/${data.fileName}`}
            alt={`${data.died} died on ${data.diedDate}, ${data.born} born on ${data.bornDate}`}
            onError={onImageError}
          />
        )}
        <Fade in={isPending || imageError}>
          <Box sx={loaderRoot}>
            {isPending ? (
              <CircularProgress size={72} />
            ) : imageError ? (
              <ErrorIcon color="error" sx={{ fontSize: "72px" }} />
            ) : null}
          </Box>
        </Fade>
      </Box>
    ),
    [data, isPending, imageError]
  );

  const infoBox = useMemo(
    () =>
      data && (
        <Collapse in appear>
          <Typography>
            <span style={bold}>Died:</span>{" "}
            <Link href={data.diedUrl} target="_blank">
              {data.died}
            </Link>
          </Typography>
          <Typography>
            <span style={bold}>Born:</span>{" "}
            <Link href={data.bornUrl} target="_blank">
              {data.born}
            </Link>
          </Typography>
        </Collapse>
      ),
    [data]
  );

  return (
    <React.Fragment>
      <WrappedGrid>
        <Grid item xxs={12} lg>
          <Stack
            direction={isMobile || upLg ? "column" : "row"}
            spacing={3}
            alignItems={isMobile || upLg ? "flex-start" : "center"}
          >
            <TextField
              select
              sx={{ width: "100%" }}
              label="Choose generation method"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              {methods.map((m) => (
                <MenuItem key={m.key} value={m.key}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              disabled={isPending || timeLeft >= 0}
              onClick={onGenerateClick}
              sx={{ width: "100%" }}
            >
              Let's go
            </Button>
            {upLg && infoBox}
          </Stack>
        </Grid>
        {!upLg ? (
          <React.Fragment>
            <Grid item xxs={12}>
              {rateLimitError}
            </Grid>
            <Grid item xxs={12} display="flex" justifyContent="center">
              {imageContainer}
            </Grid>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Grid item>{imageContainer}</Grid>
            <Grid item lg={12}>
              {rateLimitError}
            </Grid>
          </React.Fragment>
        )}
      </WrappedGrid>
      {!upLg && infoBox}
    </React.Fragment>
  );
};

export default Generator;
