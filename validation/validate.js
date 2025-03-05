const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false }); // Validate request body
    if (error) {
        return res.status(400).json({ errors: error.details.map(err => err.message) });
    }
    next(); // Proceed to the next middleware/controller
};

module.exports = validate;
