const Joi = require('joi');

const loginJoiSchema = Joi.object({

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),

    email: Joi.string()
        .lowercase()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        
    phone : Joi.string(), 

    
})
.or('email', 'phone');


module.exports = loginJoiSchema