const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyProfile, updateMyProfile } = require('../controllers/profileController');

router.get('/', protect, getMyProfile);
router.put('/', protect, updateMyProfile);

module.exports = router;