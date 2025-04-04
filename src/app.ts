import express, { Request, Response, NextFunction } from "express";
import requestId from "express-request-id";
import societyRoutes from "./routes/societyRoute";
import logger from "./config/logger";
import { HttpError } from "http-errors";

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Promise Rejection: ${reason}`);
  process.exit(1);
});

const app = express();

// Middleware
app.use(express.json());
app.use(requestId());
app.use("/api/v1/society", societyRoutes);

// Routes
app.get("/", async (_req, res) => {
  res.json({ message: "Welcome to Shrika backend" });
});

// Global Error Handling Middleware
// eslint-disable-next-line no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  const errorType = err.name || "InternalServerError";
  const errorMessage = err.message || "Something went wrong";
  const requestPath = req.path;
  const requestId = (req as Request & { id?: string }).id || "N/A";

  // Log the full error stack for debugging
  logger.error(
    JSON.stringify({
      level: "error",
      statusCode,
      type: errorType,
      message: errorMessage,
      path: requestPath,
      requestID: requestId,
      timestamp: new Date().toISOString(),
    }),
  );

  res.status(statusCode).json({
    error: {
      type: errorType,
      message: errorMessage,
      path: requestPath,
      timestamp: new Date().toISOString(),
    },
  });
});

export default app;
