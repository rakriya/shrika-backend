/* eslint-disable no-process-env */
import { config } from "dotenv";
import { cleanEnv, port, str } from "envalid";

config();

export const env = cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str({
    default: "development",
    choices: ["production", "development"],
  }),
  REDIS_HOST: str(),
  REDIS_PORT: port(),
  REDIS_PASSWORD: str(),

  TWILIO_ACCOUNT_SID: str(),
  TWILIO_AUTH_TOKEN: str(),
  TWILIO_PHONE_NUMBER: str(),
});

export default env;
