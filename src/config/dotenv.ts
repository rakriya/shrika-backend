import { config } from "dotenv";
import { cleanEnv, port, str } from "envalid";
import path from "path";

config({
  // eslint-disable-next-line no-process-env
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "development"}`),
});

// eslint-disable-next-line no-process-env
export const env = cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str({
    default: "development",
    choices: ["production", "development"],
  }),
});

export default env;
