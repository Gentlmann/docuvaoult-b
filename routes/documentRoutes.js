const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const checkPermission = require('../middleware/permissionMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadDocumentValidation, validate } = require('../validators/documentValidators');
const {
  uploadDocument,
  getDocuments,
  searchDocuments,
  downloadDocument,
  archiveDocument,
  uploadNewVersion,
  getVersionHistory,
  downloadVersion,
} = require('../controllers/documentController');

router.post(
  '/',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('documents', 'write'),
  upload.single('file'),
  uploadDocumentValidation,
  validate,
  uploadDocument
);
router.get('/', protect, authorize('office_admin', 'staff'), checkPermission('documents', 'read'), getDocuments);
router.get('/search', protect, authorize('office_admin', 'staff'), checkPermission('documents', 'read'), searchDocuments);
router.get('/versions/:versionId/download', protect, authorize('office_admin', 'staff'), checkPermission('documents', 'read'), downloadVersion);
router.get('/:id/versions', protect, authorize('office_admin', 'staff'), checkPermission('documents', 'read'), getVersionHistory);
router.post('/:id/versions', protect, authorize('office_admin', 'staff'), checkPermission('documents', 'write'), upload.single('file'), uploadNewVersion);
router.get('/:id/download', protect, authorize('office_admin', 'staff'), checkPermission('documents', 'read'), downloadDocument);
router.delete('/:id', protect, authorize('office_admin', 'staff'), checkPermission('documents', 'write'), archiveDocument);

module.exports = router;