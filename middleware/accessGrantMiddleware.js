const { hasActiveGrant } = require('../controllers/accessGrantController');
const { logAction } = require('../services/auditService');

// Only for Super Admin viewing office-specific data with an active grant
const requireActiveGrant = async (req, res, next) => {
  const { officeId } = req.params;

  const hasGrant = await hasActiveGrant(req.user.id, officeId);

  if (!hasGrant) {
    return res.status(403).json({ message: 'No active access grant for this office' });
  }

  // Log every single access, not just the grant request itself
  await logAction({
    userId: req.user.id,
    officeId,
    action: 'SUPER_ADMIN_VIEWED_OFFICE_DATA',
    resourceType: 'Office',
    resourceId: officeId,
  });

  next();
};

module.exports = { requireActiveGrant };