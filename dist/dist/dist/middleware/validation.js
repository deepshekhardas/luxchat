const Joi = require('joi');
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }
    next();
};
const schemas = {
    signup: Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        profile_pic: Joi.string().uri().optional()
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    createGroup: Joi.object({
        name: Joi.string().min(1).required(),
        members: Joi.array().items(Joi.string()).required(), // Array of User IDs
        description: Joi.string().optional()
    }),
    sendMessage: Joi.object({
        recipient_id: Joi.string().optional(), // For logic check in controller
        group_id: Joi.string().optional(),
        text: Joi.string().required().min(1),
        attachments: Joi.array().optional()
    }).xor('recipient_id', 'group_id') // Must have either recipient OR group, not both/neither
};
module.exports = { validate, schemas };
