const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deactivateStaff,
  reactivateStaff,
  createOfficeAdmin,
  deleteStaff,

} = require('../controllers/userController');
const { createStaffValidation, validate } = require('../validators/staffValidators');

router.post('/office-admin', protect, authorize('super_admin'), createOfficeAdmin);
router.post('/staff', protect, authorize('office_admin'), createStaff);
router.get('/staff', protect, authorize('office_admin'), getStaff);
router.get('/staff/:id', protect, authorize('office_admin'), getStaffById);
router.put('/staff/:id', protect, authorize('office_admin'), updateStaff);
router.put('/staff/:id/deactivate', protect, authorize('office_admin'), deactivateStaff);
router.put('/staff/:id/reactivate', protect, authorize('office_admin'), reactivateStaff);
router.post('/staff', protect, authorize('office_admin'), createStaffValidation, validate, createStaff);
router.delete('/staff/:id', protect, authorize('office_admin'), deleteStaff);


module.exports = router;