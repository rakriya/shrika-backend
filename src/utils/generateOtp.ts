import { OTP_CONTENT, OTP_LENGTH } from "../constants";

export const generateOtp = () => {
  const content = OTP_CONTENT;
  const length = OTP_LENGTH;

  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += content.charAt(Math.floor(Math.random() * content.length));
  }
  return otp;
};
