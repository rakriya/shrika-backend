import env from "../config/dotenv";
import logger from "../config/logger";
import transporter from "../config/nodemailer";

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  try {
    const mailOptions = {
      from: env.GOOGLE_GMAIL_USER,
      to,
      subject,
      ...(html ? { html } : { text }),
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info("Email is sent successfully ", { to, result });
  } catch (error) {
    logger.error("Error sending email: ", { to, error });
  }
};
