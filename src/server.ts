import express from "express";
import env from "./config/dotenv";

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
  console.log(`Server running at http://localhost:${PORT}`);
});
