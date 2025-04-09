import express, { Request, Response, NextFunction } from "express";
import requestId from "express-request-id";
import societyRoutes from "./routes/societyRoute";
import authRoute from "./routes/authRoute";
import otpRoute from "./routes/otpRoute";
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
app.set("trust proxy", true);

// Middleware
app.use(express.json());
app.use(requestId());
app.use("/api/v1/societies", societyRoutes);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/otp", otpRoute);

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

  const errorResponse: any = {
    error: {
      type: errorType,
      message: errorMessage,
      path: requestPath,
      timestamp: new Date().toISOString(),
    },
  };

  // 🔹 Include validation error details if available
  if ((err as any).details) {
    errorResponse.error.details = (err as any).details;
  }

  // Log the error
  logger.error(
    JSON.stringify({
      level: "error",
      statusCode,
      type: errorType,
      message: errorMessage,
      details: errorResponse.error.details || null,
      path: requestPath,
      requestID: requestId,
      timestamp: new Date().toISOString(),
    }),
  );

  res.status(statusCode).json(errorResponse);
});

export default app;
