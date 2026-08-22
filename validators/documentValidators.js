const { body, validationResult } = require('express-validator');

const uploadDocumentValidation = [
  body('clientId').notEmpty().withMessage('Client is required').isMongoId().withMessage('Invalid client ID'),
  body('caseId').notEmpty().withMessage('Case is required').isMongoId().withMessage('Invalid case ID'),
  body('category').notEmpty().withMessage('Category is required'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { uploadDocumentValidation, validate };