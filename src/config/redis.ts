import Redis from "ioredis";
import env from "./dotenv";
import logger from "./logger";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
});

redis.on("connect", () => {
  logger.info("✅ Redis connected successfully!");
});

redis.on("error", (err) => {
  logger.error("❌ Redis connection error:", err);
});

export default redis;
