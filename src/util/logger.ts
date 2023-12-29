import dotenv from "dotenv";
import expressWinston from "express-winston";
import winston, { format, LoggerOptions } from "winston";

dotenv.config();
const { LOG_LEVEL } = process.env;

const formatMessage = format.combine(
  format.timestamp({ format: "DD/MM/YYYY HH:mm:ss.SSSS" }),
  format.printf(
    (info) =>
      `${info.timestamp} ${`[${info.level.toUpperCase()}]`.padEnd(7)} ${
        info.message
      }`
  )
);

const loggerOptions: LoggerOptions = {
  level: LOG_LEVEL || "info",
  transports: [
    new winston.transports.Console({ format: formatMessage }),
    new winston.transports.File({
      filename: "express.log",
    }),
  ],
};

export const logger = winston.createLogger(loggerOptions);

const expressLogger = expressWinston.logger({
  winstonInstance: logger,
  msg: "[{{req.method}}] [{{res.statusCode}}] {{req.url}} {{res.responseTime}}ms",
});

const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  msg: "{{err.message}} ([{{req.method}}] [{{res.statusCode}}] {{req.url}})",
});

export { expressLogger, errorLogger };
