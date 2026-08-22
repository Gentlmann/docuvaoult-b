const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const checkPermission = require('../middleware/permissionMiddleware');
const { createClientValidation, updateClientValidation, validate } = require('../validators/clientValidators');
const {
  createClient,
  getClients,
  searchClients,
  getClientById,
  updateClient,
  archiveClient,
} = require('../controllers/clientController');

router.post(
  '/',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('clients', 'write'),
  createClientValidation,
  validate,
  createClient
);

router.get(
  '/',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('clients', 'read'),
  getClients
);

router.get(
  '/search',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('clients', 'read'),
  searchClients
);

router.get(
  '/:id',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('clients', 'read'),
  getClientById
);

router.put(
  '/:id',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('clients', 'write'),
  updateClientValidation,
  validate,
  updateClient
);

router.delete(
  '/:id',
  protect,
  authorize('office_admin', 'staff'),
  checkPermission('clients', 'write'),
  archiveClient
);

module.exports = router;