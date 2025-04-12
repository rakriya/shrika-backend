import Joi from "joi";

export const societySetupSchema = Joi.object({
  societyName: Joi.string().min(3).max(50).required(),

  adminName: Joi.string().min(3).max(50).required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters.",
    "string.max": "Name must be at most 50 characters.",
  }),

  adminEmail: Joi.string()
    .email({ minDomainSegments: 3, tlds: { allow: ["com", "net", "in"] } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address.",
      "string.empty": "Phone number is required.",
    }),

  adminPhoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must have exactly 10 digits.",
      "string.empty": "Phone number is required.",
    }),

  adminPassword: Joi.string()
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
}).with("password", "cpassword");
