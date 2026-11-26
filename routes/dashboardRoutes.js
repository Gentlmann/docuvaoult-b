const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { getOfficeDashboard, getSuperAdminDashboard } = require('../controllers/dashboardController');
const { getStaffDashboard } = require('../controllers/staffDashboardController');
const { getPendingDocuments } = require('../controllers/approvalsController');

router.get('/office', protect, authorize('office_admin'), getOfficeDashboard);
router.get('/pending-documents', protect, authorize('office_admin'), getPendingDocuments);
router.get('/staff', protect, authorize('staff'), getStaffDashboard);
router.get('/super-admin', protect, authorize('super_admin'), getSuperAdminDashboard);

module.exports = router;