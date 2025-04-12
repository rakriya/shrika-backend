/* eslint-disable no-process-env */
import { config } from "dotenv";
import { cleanEnv, num, port, str } from "envalid";

config();

export const env = cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str({
    default: "development",
    choices: ["production", "development"],
  }),
  SHRIKA_TEAM_ACCESS_TOKEN: str(),

  REDIS_HOST: str(),
  REDIS_PORT: port(),
  REDIS_PASSWORD: str(),

  TWILIO_ACCOUNT_SID: str(),
  TWILIO_AUTH_TOKEN: str(),
  TWILIO_PHONE_NUMBER: str(),

  RAZORPAY_KEY_ID: str(),
  RAZORPAY_KEY_SECRET: str(),
  RAZORPAY_PLAN_ID: str(),

  PRIVATE_KEY: str(),
  PUBLIC_KEY: str(),

  COOKIE_DOMAIN: str(),
  ACCESS_TOKEN_EXPIRY_MINUTES: num(),
  REFRESH_TOKEN_EXPIRY_DAYS: num(),
  REFRESH_JWT_SECRET_KEY: str(),
});

export default env;
