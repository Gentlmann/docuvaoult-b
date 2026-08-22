const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const checkPermission = require('../middleware/permissionMiddleware');
const { createCaseValidation, updateCaseValidation, validate } = require('../validators/caseValidators');
const { createCase, getCases, searchCases, getCaseById, updateCase, archiveCase } = require('../controllers/caseController');

router.post(
  '/',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('cases', 'write'),
  createCaseValidation,
  validate,
  createCase
);

router.get(
  '/',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('cases', 'read'),
  getCases
);

router.get(
  '/search',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('cases', 'read'),
  searchCases
);

router.get(
  '/:id',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('cases', 'read'),
  getCaseById
);

router.put(
  '/:id',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('cases', 'write'),
  updateCaseValidation,
  validate,
  updateCase
);

router.delete(
  '/:id',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('cases', 'write'),
  archiveCase
);

module.exports = router;