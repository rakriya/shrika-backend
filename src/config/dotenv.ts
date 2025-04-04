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
});

export default env;
