import { config } from "dotenv";
import { cleanEnv, num, port, str } from "envalid";
import path from "path";

config({
  path: path.join(
    __dirname,
    `../../.env.${process.env.NODE_ENV || "development"}`
  ),
});

export const env = cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str({
    default: "development",
    choices: ["production", "development"],
  }),
});

export default env;
