const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const {
  getOfficeAuditLogs,
  getPlatformAuditLogs,
  deleteOfficeAuditLog,
  deletePlatformAuditLog,
  clearOfficeAuditLogs,
  clearPlatformAuditLogs,
} = require('../controllers/auditController');

router.get(
  '/office',
  protect,
  authorize('office_admin'),
  getOfficeAuditLogs
);

router.get(
  '/platform',
  protect,
  authorize('super_admin'),
  getPlatformAuditLogs
);

router.delete(
  '/office/:id',
  protect,
  authorize('office_admin'),
  deleteOfficeAuditLog
);

router.delete(
  '/platform/:id',
  protect,
  authorize('super_admin'),
  deletePlatformAuditLog
);

router.delete(
  '/office',
  protect,
  authorize('office_admin'),
  clearOfficeAuditLogs
);

router.delete(
  '/platform',
  protect,
  authorize('super_admin'),
  clearPlatformAuditLogs
);

module.exports = router;