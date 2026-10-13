const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { requireActiveGrant } = require('../middleware/accessGrantMiddleware');
const uploadLogo = require('../middleware/logoUploadMiddleware');
const validateFileContent = require('../middleware/fileContentValidator');
const {
  createOffice,
  getOffices,
  getOfficeClients,
  updateOffice,
  suspendOffice,
  activateOffice,
  approveOffice,
  rejectOffice,
  getMyOffice,
  updateMyOffice,
  uploadOfficeLogo,
  deleteOffice,
} = require('../controllers/officeController');

router.post('/', protect, authorize('super_admin'), createOffice);
router.get('/', protect, authorize('super_admin'), getOffices);

// /me routes must come BEFORE /:id
router.get('/me', protect, authorize('office_admin'), getMyOffice);
router.put('/me', protect, authorize('office_admin'), updateMyOffice);
router.post('/me/logo', protect, authorize('office_admin'), uploadLogo.single('logo'), validateFileContent, uploadOfficeLogo);

router.get('/:officeId/clients', protect, authorize('super_admin'), requireActiveGrant, getOfficeClients);
router.put('/:id/approve', protect, authorize('super_admin'), approveOffice);
router.put('/:id/reject', protect, authorize('super_admin'), rejectOffice);
router.put('/:id/suspend', protect, authorize('super_admin'), suspendOffice);
router.put('/:id/activate', protect, authorize('super_admin'), activateOffice);
router.put('/:id', protect, authorize('super_admin'), updateOffice);
router.delete('/:id', protect, authorize('super_admin'), deleteOffice);

module.exports = router;