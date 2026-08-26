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
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
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
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// Office Admin deletes one audit log permanently
const deleteOfficeAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
    });

    if (!log) {
      return res.status(404).json({
        message: 'Audit log not found',
      });
    }

    await AuditLog.deleteOne({ _id: log._id });

    res.json({
      message: 'Audit log permanently deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// Office Admin clears all audit logs from their office
const clearOfficeAuditLogs = async (req, res) => {
  try {
    const result = await AuditLog.deleteMany({
      officeId: req.user.officeId,
    });

    res.json({
      message: 'Office audit logs permanently deleted',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// Super Admin deletes one audit log permanently
const deletePlatformAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        message: 'Audit log not found',
      });
    }

    await AuditLog.deleteOne({ _id: log._id });

    res.json({
      message: 'Audit log permanently deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// Super Admin clears all platform audit logs
const clearPlatformAuditLogs = async (req, res) => {
  try {
    const result = await AuditLog.deleteMany({});

    res.json({
      message: 'All platform audit logs permanently deleted',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getOfficeAuditLogs,
  getPlatformAuditLogs,
  deleteOfficeAuditLog,
  clearOfficeAuditLogs,
  deletePlatformAuditLog,
  clearPlatformAuditLogs,
};