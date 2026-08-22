const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { requireActiveGrant } = require('../middleware/accessGrantMiddleware');
const uploadLogo = require('../middleware/logoUploadMiddleware');
const {
  createOffice,
  getOffices,
  getOfficeClients,
  updateOffice,
  suspendOffice,
  activateOffice,
  getMyOffice,
  updateMyOffice,
  uploadOfficeLogo,
} = require('../controllers/officeController');

router.post('/', protect, authorize('super_admin'), createOffice);
router.get('/', protect, authorize('super_admin'), getOffices);

// IMPORTANT: /me routes must come BEFORE /:id — otherwise "me" gets treated as an ID
router.get('/me', protect, authorize('office_admin'), getMyOffice);
router.put('/me', protect, authorize('office_admin'), updateMyOffice);
router.post('/me/logo', protect, authorize('office_admin'), uploadLogo.single('logo'), uploadOfficeLogo);

router.get('/:officeId/clients', protect, authorize('super_admin'), requireActiveGrant, getOfficeClients);
router.put('/:id', protect, authorize('super_admin'), updateOffice);
router.put('/:id/suspend', protect, authorize('super_admin'), suspendOffice);
router.put('/:id/activate', protect, authorize('super_admin'), activateOffice);

module.exports = router;