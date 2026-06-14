import Joi from "joi";

/**
 * RESOURCE VALIDATION
 */
export const createResourceValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(150).required(),

    link: Joi.string().uri().required(),

    category: Joi.string().min(2).max(50).required(),
  });

  return schema.validate(data);
};