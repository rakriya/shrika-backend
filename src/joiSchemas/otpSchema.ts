import Joi from "joi";
import { OTP_PURPOSE } from "../constants";

export const sendOtpSchema = Joi.object({
  phoneNumber: Joi.string().required().messages({
    "string.pattern.base": "Phone number must have exactly 10 digits.",
    "string.empty": "Phone number is required.",
  }),

  societyId: Joi.string().required().messages({
    "string.empty": "SocietyID is required.",
  }),

  memberId: Joi.string(),

  purpose: Joi.string()
    .equal(...Object.values(OTP_PURPOSE))
    .required()
    .messages({
      "string.empty": "OTP purpose is required.",
      "string.equal": `OTP purpose must be from: ${Object.values(OTP_PURPOSE).join(", ")}.`,
    }),
});
