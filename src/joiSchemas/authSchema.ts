import Joi from "joi";
import { OTP_LENGTH } from "../constants";

export const loginSchema = Joi.object({
  phoneNumber: Joi.string().required().messages({
    "string.pattern.base": "Phone number must have exactly 10 digits.",
    "string.empty": "Phone number is required.",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
  }),
  societyId: Joi.string().required().messages({
    "string.empty": "SocietyID is required.",
  }),
  otp: Joi.string()
    .min(OTP_LENGTH)
    .max(OTP_LENGTH)
    .required()
    .messages({
      "string.min": `OTP must be ${OTP_LENGTH} characters.`,
      "string.max": `OTP must be ${OTP_LENGTH} characters.`,
      "string.empty": "OTP is required.",
    }),
});
