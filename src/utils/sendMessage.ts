import env from "../config/dotenv";
import client from "../config/twilio";

export const sendMessage = async ({
  body,
  to,
  from = env.TWILIO_PHONE_NUMBER,
}: {
  body: string;
  to: string;
  from?: string;
}) => {
  const response = await client.messages.create({ body, to, from });
  return response;
};
