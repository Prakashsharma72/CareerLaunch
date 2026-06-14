import Joi from "joi";

/**
 * REGISTER VALIDATION
 */
export const registerValidator = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),

    email: Joi.string().email().required(),

    password: Joi.string().min(6).required(),

    role: Joi.string().valid("student", "admin").optional(),
  });

  return schema.validate(data);
};

/**
 * LOGIN VALIDATION
 */
export const loginValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),

    password: Joi.string().required(),
  });

  return schema.validate(data);
};