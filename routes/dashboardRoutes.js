const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { getOfficeDashboard, getSuperAdminDashboard } = require('../controllers/dashboardController');
const validateFileContent = require('../middleware/fileContentValidator');

router.get('/office', protect, authorize('office_admin'), getOfficeDashboard);
router.get('/super-admin', protect, authorize('super_admin'), getSuperAdminDashboard);

module.exports = router;