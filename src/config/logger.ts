import winston from "winston";
import env from "./dotenv";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }),
  ),
  defaultMeta: { service: "shrika-backend" },
  transports: [
    new winston.transports.File({
      dirname: "logs",
      filename: "combined.log",
      level: "info",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
    }),
  ],
});

if (env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  );
}

export default logger;
