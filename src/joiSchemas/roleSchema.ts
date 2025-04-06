import Joi from "joi";
import { ALLOWED_PERMISSIONS } from "../constants";

// Joi uses the same list for validation
export const roleCreationSchema = Joi.object({
  name: Joi.string().required(),
  permissions: Joi.array()
    .items(Joi.string().valid(...ALLOWED_PERMISSIONS))
    .required(),
});
