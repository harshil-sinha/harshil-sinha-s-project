import Joi from "joi";

const signupSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required().trim().replace(/'/g, "''"),
  last_name: Joi.string().min(2).max(50).required().trim().replace(/'/g, "''"),
  gender: Joi.string().valid("Male", "Female", "Other").required().trim(),
  dob: Joi.date().iso().required(),
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(8).required().trim().replace(/'/g, "''"),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .trim(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .optional()
    .trim(),
  otp_expires_at: Joi.date().optional(),
});

export default signupSchema;
