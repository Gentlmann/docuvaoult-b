const Document = require('../models/Document');

// Oldest first, so the manager works through the queue in order
const getPendingDocuments = async (req, res) => {
  try {
    // Older documents have no approvalStatus saved; they count as pending
    const query = {
      officeId: req.user.officeId,
      isArchived: false,
      approvalStatus: { $in: ['pending', null] },
    };

    const total = await Document.countDocuments(query);

    const documents = await Document.find(query)
      .sort({ createdAt: 1 })
      .limit(50)
      .populate('uploadedBy', 'name')
      .populate('clientId', 'fullName')
      .populate('caseId', 'title')
      .select('fileName category uploadedBy clientId caseId createdAt');

    res.json({ total, documents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPendingDocuments };