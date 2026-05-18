const Joi = require('joi');

const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().lowercase().trim(),
    program: Joi.string().valid('UI/UX Design', 'Full Stack Development', 'Digital Marketing', 'Data Science').required()
});

const authSchema = Joi.object({
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().min(2).max(100).trim()
});

const validateContact = (req, res, next) => {
    const { error } = contactSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            message: error.details[0].message
        });
    }
    next();
};

const validateAuth = (req, res, next) => {
    const { error } = authSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            message: error.details[0].message
        });
    }
    next();
};

module.exports = {
    validateContact,
    validateAuth
};
