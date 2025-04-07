import env from "./dotenv";
import twilio from "twilio";

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN, {
  autoRetry: true,
  maxRetries: 3,
});

export default client;
