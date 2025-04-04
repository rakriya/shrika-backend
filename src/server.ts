import express from "express";
import env from "./config/dotenv";
import logger from "./config/logger";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = env.PORT || 5501;
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Routes
app.get("/", async (_req, res) => {
  await prisma.user.create({
    data: { name: "Alice", email: "alice@example.com" },
  });

  const users = await prisma.user.findMany();
  res.json({ message: "Welcome to Shrika backend", users });
});

// Start Server
app.listen(PORT, () => {
  logger.log("info", `Server is running on http://localhost:${PORT}`);
});
