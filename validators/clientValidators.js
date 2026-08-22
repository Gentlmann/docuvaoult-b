const { body, validationResult } = require('express-validator');

const createClientValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .isLength({ min: 10 })
    .withMessage('Phone must be at least 10 digits'),
];

const updateClientValidation = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty'),

  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone cannot be empty')
    .isLength({ min: 10 })
    .withMessage('Phone must be at least 10 digits'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  next();
};

module.exports = {
  createClientValidation,
  updateClientValidation,
  validate,
};