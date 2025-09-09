const Joi = require("joi");

const referralSchema = Joi.object({
  FirstName: Joi.string().trim().min(1).max(50).required(),
  LastName: Joi.string().trim().min(1).max(50).required(),
  Phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[\s\-\(\)0-9]{10,}$/)
    .required(),
  Email: Joi.string().email().required(),
  Message: Joi.string().trim().max(1000).allow("").optional(),
});

module.exports = { referralSchema };
