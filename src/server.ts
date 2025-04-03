import express from "express";
import env from "./config/dotenv";
import logger from "./config/logger";

const app = express();
const PORT = env.PORT || 5501;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, TypeScript Server!");
});

// Start Server
app.listen(PORT, () => {
  logger.log("info", `Server is running on http://localhost:${PORT}`);
});
