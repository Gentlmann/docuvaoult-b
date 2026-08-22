const AuditLog = require('../models/AuditLog');

const logAction = async ({ userId, officeId, action, resourceType, resourceId, metadata }) => {
  try {
    await AuditLog.create({
      userId,
      officeId,
      action,
      resourceType,
      resourceId,
      metadata,
    });
  } catch (error) {
    // Deliberately don't throw - a failed audit log should never break the actual request
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = { logAction };