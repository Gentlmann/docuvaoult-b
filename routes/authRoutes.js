const express = require('express');
const router = express.Router();
const { registerUser, registerOffice, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../validators/authValidators');
const { registerOfficeValidation, validate: validateOfficeRegistration } = require('../validators/officeRegistrationValidators');

router.post('/register', registerValidation, validate, registerUser);
router.post('/register-office', registerOfficeValidation, validateOfficeRegistration, registerOffice);
router.post('/login', loginValidation, validate, loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;