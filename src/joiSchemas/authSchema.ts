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

export const forgotPasswordSchema = Joi.object({
  phoneNumber: Joi.string().required().messages({
    "string.pattern.base": "Phone number must have exactly 10 digits.",
    "string.empty": "Phone number is required.",
  }),

  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required()
    .messages({
      "string.pattern.base": "Password must be 3-30 characters long and alphanumeric only.",
      "string.empty": "Password is required.",
    }),

  cpassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the password.",
    "string.empty": "Confirm password is required.",
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
}).with("password", "cpassword");

export const resetPasswordSchema = Joi.object({
  oldPawssword: Joi.string().required().messages({
    "string.empty": "Old password is required.",
  }),

  newPassword: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required()
    .messages({
      "string.pattern.base": "Password must be 3-30 characters long and alphanumeric only.",
      "string.empty": "Password is required.",
    }),

  cpassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the password.",
    "string.empty": "Confirm password is required.",
  }),
});
