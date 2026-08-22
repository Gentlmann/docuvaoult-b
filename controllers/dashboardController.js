const Client = require('../models/Client');
const Case = require('../models/Case');
const Document = require('../models/Document');
const User = require('../models/User');
const Office = require('../models/Office');


// Office Admin dashboard — stats scoped to their own office
const { getStorageUsageBytes } = require('../services/storageService');

const getOfficeDashboard = async (req, res) => {
  try {
    const officeId = req.user.officeId;

    const totalClients = await Client.countDocuments({ officeId, isArchived: false });
    const activeCases = await Case.countDocuments({ officeId, status: 'open' });
    const totalDocuments = await Document.countDocuments({ officeId, isArchived: false });
    const staffCount = await User.countDocuments({ officeId, role: 'staff', isActive: true });

    const office = await Office.findById(officeId);
    const usageBytes = await getStorageUsageBytes(officeId);
    const totalStorageMB = (usageBytes / (1024 * 1024)).toFixed(2);
    const storageQuotaMB = office.storageQuotaMB;
    const storagePercentUsed = Math.min(100, ((usageBytes / (1024 * 1024) / storageQuotaMB) * 100)).toFixed(1);

    const documentsByCategory = await Document.aggregate([
      { $match: { officeId, isArchived: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      totalClients,
      activeCases,
      totalDocuments,
      staffCount,
      totalStorageMB,
      storageQuotaMB,
      storagePercentUsed,
      documentsByCategory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Super Admin dashboard — platform-wide stats across ALL offices
const getSuperAdminDashboard = async (req, res) => {
  try {
    const totalOffices = await Office.countDocuments();
    const activeOffices = await Office.countDocuments({ status: 'active' });
    const suspendedOffices = await Office.countDocuments({ status: 'suspended' });

    const totalUsers = await User.countDocuments();
    const totalClients = await Client.countDocuments({ isArchived: false });
    const totalDocuments = await Document.countDocuments({ isArchived: false });

    // Total storage used across the ENTIRE platform
    const storageResult = await Document.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: null, totalBytes: { $sum: '$fileSize' } } },
    ]);
    const totalStorageMB = ((storageResult[0]?.totalBytes || 0) / (1024 * 1024)).toFixed(2);

    // Offices grouped by subscription plan
    const officesByPlan = await Office.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } },
    ]);

    res.json({
      totalOffices,
      activeOffices,
      suspendedOffices,
      totalUsers,
      totalClients,
      totalDocuments,
      totalStorageMB,
      officesByPlan,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getOfficeDashboard, getSuperAdminDashboard };