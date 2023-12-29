import { CloseRounded as ErrorIcon } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Fade,
  Link,
  MenuItem,
  Stack,
  SxProps,
  Theme,
  Typography,
  styled,
} from "@mui/material";
import { AxiosError, isAxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import TextField from "../../../components/TextField";
import { methods } from "../../../data/methods";
import { useIsMobile } from "../../../util/useIsMobile";
import {
  GenerateResponse,
  useGenerateMutation,
} from "../hooks/useGenerateMutation";

const baseUrl = import.meta.env.VITE_BASE_URL;

const imgContainerSx: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  aspectRatio: "6 / 5",
  maxWidth: "600px",
  backgroundColor: (theme) => theme.palette.secondary.main,
  borderRadius: "6px",
  overflow: "hidden",
};

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

const Generator: React.FC = () => {
  const isMobile = useIsMobile();
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

  return (
    <React.Fragment>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={3}
        alignItems={isMobile ? "flex-start" : "center"}
      >
        <TextField
          select
          sx={{ flexGrow: "1", maxWidth: "300px" }}
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
        >
          Let's go
        </Button>
      </Stack>
      <Collapse in={timeLeft > 0}>
        <Alert severity="error">
          <AlertTitle>Too many requests!</AlertTitle>
          Try again in <span style={bold}>{timeLeft}</span> second
          {timeLeft !== 1 ? "s" : ""}.
        </Alert>
      </Collapse>
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
      {data && (
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
      )}
    </React.Fragment>
  );
};

export default Generator;
