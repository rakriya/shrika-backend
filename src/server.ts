import express from "express";
import env from "./config/dotenv";
import logger from "./config/logger";
import societyRoutes from "./routes/societyRoute";

const app = express();
const PORT = env.PORT || 5501;

// Middleware
app.use(express.json());

app.use("/api/v1/society", societyRoutes);

// Routes
app.get("/", async (_req, res) => {
  res.json({ message: "Welcome to Shrika backend" });
});

// Start Server
app.listen(PORT, () => {
  logger.log("info", `Server is running on http://localhost:${PORT}`);
});
