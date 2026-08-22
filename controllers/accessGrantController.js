const AccessGrant = require('../models/AccessGrant');
const { logAction } = require('../services/auditService');

// Super Admin requests temporary access to an office's data
const requestAccess = async (req, res) => {
  try {
    const { officeId, reason, hoursValid } = req.body;

    if (!officeId || !reason) {
      return res.status(400).json({ message: 'officeId and reason are required' });
    }

    const expiresAt = new Date(Date.now() + (hoursValid || 24) * 60 * 60 * 1000);

    const grant = await AccessGrant.create({
      grantedTo: req.user.id,
      officeId,
      reason,
      expiresAt,
    });

    // CRITICAL: this action itself must be logged — it's the most sensitive action in the system
    await logAction({
      userId: req.user.id,
      officeId,
      action: 'REQUEST_OFFICE_ACCESS',
      resourceType: 'AccessGrant',
      resourceId: grant._id,
      metadata: { reason, expiresAt },
    });

    res.status(201).json(grant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper: check if Super Admin currently has an active grant for this office
const hasActiveGrant = async (userId, officeId) => {
  const grant = await AccessGrant.findOne({
    grantedTo: userId,
    officeId,
    isActive: true,
    expiresAt: { $gt: new Date() }, // not yet expired
  });
  return !!grant;
};

module.exports = { requestAccess, hasActiveGrant };