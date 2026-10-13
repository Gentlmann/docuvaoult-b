const { body, validationResult } = require('express-validator');

const registerOfficeValidation = [
  body('officeName').trim().notEmpty().withMessage('Office name is required').isLength({ max: 100 }).withMessage('Office name is too long'),
  body('officeType').isIn(['notary', 'legal', 'law_firm', 'other']).withMessage('Invalid office type'),
  body('adminName').trim().notEmpty().withMessage('Your name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { registerOfficeValidation, validate };