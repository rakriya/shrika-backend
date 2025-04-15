import nodemailer from "nodemailer";
import env from "./dotenv";

import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;

// create OAuth2 client
const oauth2Client = new OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground",
);

// set refresh token
oauth2Client.setCredentials({
  refresh_token: env.GOOGLE_REFRESH_TOKEN,
});

// get access token using promise
const accessToken = oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: env.GOOGLE_GMAIL_USER,
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    refreshToken: env.GOOGLE_REFRESH_TOKEN,
    accessToken: accessToken.toString(),
  },
});

export default transporter;
