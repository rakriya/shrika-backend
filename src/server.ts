import app from "./app";
import env from "./config/dotenv";
import logger from "./config/logger";

const startServer = async () => {
  const PORT = env.PORT || 5500;

  try {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}..`);
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to start the server: ${error.message}`);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

void startServer();
