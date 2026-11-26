const Client = require('../models/Client');
const Case = require('../models/Case');
const Document = require('../models/Document');

const getStaffDashboard = async (req, res) => {
  try {
    const officeId = req.user.officeId;
    const userId = req.user.id;
    const perms = req.user.permissions || {};

    const level = (resource) => perms[resource] || 'none';
    const can = (resource) => level(resource) !== 'none';

    const data = {
      permissions: {
        clients: level('clients'),
        cases: level('cases'),
        documents: level('documents'),
      },
    };

    // Only compute and send what this staff member is allowed to see
    if (can('clients')) {
      data.totalClients = await Client.countDocuments({ officeId, isArchived: false });
    }

    if (can('cases')) {
      data.openCases = await Case.countDocuments({ officeId, status: 'open' });
    }

    if (can('documents')) {
      const mine = { officeId, uploadedBy: userId, isArchived: false };

      data.totalDocuments = await Document.countDocuments({ officeId, isArchived: false });

      // Older documents have no approvalStatus saved; they count as pending
      data.myPending = await Document.countDocuments({
        ...mine,
        approvalStatus: { $in: ['pending', null] },
      });
      data.myApproved = await Document.countDocuments({ ...mine, approvalStatus: 'approved' });
      data.myRejected = await Document.countDocuments({ ...mine, approvalStatus: 'rejected' });

      data.recentUploads = await Document.find(mine)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('clientId', 'fullName')
        .populate('caseId', 'title')
        .select('fileName approvalStatus createdAt clientId caseId');

      data.needsAttention = await Document.find({ ...mine, approvalStatus: 'rejected' })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('fileName rejectionReason');
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getStaffDashboard };