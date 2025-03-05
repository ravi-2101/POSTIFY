const Joi = require("joi");

const registerJoiSchema = Joi.object({
  userName: Joi.string().required(),

  fullName: Joi.string().required(),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),

  confirmPassword: Joi.ref("password"),

  email: Joi.string()
    .lowercase()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),

  phone: Joi.string(),

  profile: Joi.string().optional(),

  DOB: Joi.date().max("12-31-2015").required(),

  token: Joi.string().allow(null).default(null),

  tokenExpiresAt: Joi.date().default(() => Date.now()),
}).or("email", "phone");

module.exports = registerJoiSchema;
