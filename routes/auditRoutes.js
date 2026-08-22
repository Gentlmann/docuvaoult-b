const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { getOfficeAuditLogs, getPlatformAuditLogs } = require('../controllers/auditController');

router.get('/office', protect, authorize('office_admin'), getOfficeAuditLogs);
router.get('/platform', protect, authorize('super_admin'), getPlatformAuditLogs);

module.exports = router;