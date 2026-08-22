const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { requestAccess } = require('../controllers/accessGrantController');


router.post('/', protect, authorize('super_admin'), requestAccess);


module.exports = router;