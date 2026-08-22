const { body, validationResult } = require('express-validator');

const createCaseValidation = [
  body('caseNumber')
    .trim()
    .notEmpty()
    .withMessage('Case number is required'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),

  body('clientId')
    .notEmpty()
    .withMessage('Client is required')
    .isMongoId()
    .withMessage('Invalid client ID'),
];

const updateCaseValidation = [
  body('caseNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Case number cannot be empty'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),

  body('clientId')
    .optional()
    .notEmpty()
    .withMessage('Client cannot be empty')
    .isMongoId()
    .withMessage('Invalid client ID'),
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
  createCaseValidation,
  updateCaseValidation,
  validate,
};