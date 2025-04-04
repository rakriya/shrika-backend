import app from "./app";
import env from "./config/dotenv";
import logger from "./config/logger";
import prisma from "./config/prisma";

const PORT = env.PORT || 5500;

const startServer = () => {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  });

  // Handle server errors
  server.on("error", (error) => {
    logger.error(`❌ Failed to start server: ${error.message}`);
    setTimeout(() => process.exit(1), 1000);
  });

  // Graceful Shutdown Handling
  const gracefulShutdown = async (signal: string) => {
    try {
      logger.info(`${signal} received: Closing server gracefully...`);

      server.close(async () => {
        logger.info("🚀 Server shut down successfully.");
        await prisma.$disconnect();
        process.exit(0);
      });
    } catch (error) {
      logger.error(`❌ Error during shutdown: ${error}`);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

startServer();
