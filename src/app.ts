import express from "express";
import societyRoutes from "./routes/societyRoute";

const app = express();

// Middleware
app.use(express.json());

app.use("/api/v1/society", societyRoutes);

// Routes
app.get("/", async (_req, res) => {
  res.json({ message: "Welcome to Shrika backend" });
});

export default app;
