const AuditLog = require('../models/AuditLog');

// Office Admin views their office's activity log
const getOfficeAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ officeId: req.user.officeId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Super Admin views platform-wide activity log
const getPlatformAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name email role')
      .populate('officeId', 'name')
      .sort({ createdAt: -1 })
      .limit(300);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getOfficeAuditLogs, getPlatformAuditLogs };