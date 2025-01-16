import * as Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Za-z0-9]/)
    .required(),
});

export default loginSchema;
