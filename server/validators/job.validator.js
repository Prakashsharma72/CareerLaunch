import Joi from "joi";

/**
 * CREATE JOB VALIDATION
 */
export const createJobValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),

    company: Joi.string().min(2).max(100).required(),

    description: Joi.string().allow("", null),

    location: Joi.string().allow("", null),

    salary: Joi.string().allow("", null),

    type: Joi.string().valid(
      "Full-Time",
      "Part-Time",
      "Internship",
      "Contract"
    ),

    applicants: Joi.array().items(Joi.number()).optional(),
  });

  return schema.validate(data);
};