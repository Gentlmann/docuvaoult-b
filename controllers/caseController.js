const Case = require('../models/Case');
const Client = require('../models/Client');
const { logAction } = require('../services/auditService');

const createCase = async (req, res) => {
  try {
    const { caseNumber, title, clientId, caseType, description, openingDate } = req.body;

    if (!caseNumber || !title || !clientId) {
      return res.status(400).json({ message: 'caseNumber, title, and clientId are required' });
    }

    const client = await Client.findOne({ _id: clientId, officeId: req.user.officeId });
    if (!client) {
      return res.status(404).json({ message: 'Client not found in your office' });
    }

    const newCase = await Case.create({
      caseNumber,
      title,
      clientId,
      caseType,
      description,
      openingDate,
      officeId: req.user.officeId,
    });

    await logAction({
      userId: req.user.id,
      officeId: req.user.officeId,
      action: 'CREATE_CASE',
      resourceType: 'Case',
      resourceId: newCase._id,
    });

    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCases = async (req, res) => {
  try {
    const cases = await Case.find({
      officeId: req.user.officeId,
      status: { $ne: 'archived' },
    })
      .populate('clientId', 'fullName')
      .sort({ createdAt: -1 });

    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCaseById = async (req, res) => {
  try {
    const foundCase = await Case.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
    }).populate('clientId', 'fullName');

    if (!foundCase) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(foundCase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCase = async (req, res) => {
  try {
    const { title, caseType, status, description, closingDate } = req.body;

    const foundCase = await Case.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
    });

    if (!foundCase) {
      return res.status(404).json({ message: 'Case not found' });
    }

    foundCase.title = title ?? foundCase.title;
    foundCase.caseType = caseType ?? foundCase.caseType;
    foundCase.status = status ?? foundCase.status;
    foundCase.description = description ?? foundCase.description;
    foundCase.closingDate = closingDate ?? foundCase.closingDate;

    const updatedCase = await foundCase.save();

    res.json(updatedCase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const searchCases = async (req, res) => {
  try {
    const { caseNumber, title, status, caseType, sortBy, order, page, limit } = req.query;

    const query = { officeId: req.user.officeId, status: { $ne: 'archived' } };

    if (caseNumber) query.caseNumber = { $regex: caseNumber, $options: 'i' };
    if (title) query.title = { $regex: title, $options: 'i' };
    if (status) query.status = status;
    if (caseType) query.caseType = { $regex: caseType, $options: 'i' };

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const cases = await Case.find(query)
      .populate('clientId', 'fullName')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    const total = await Case.countDocuments(query);

    res.json({
      cases,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const archiveCase = async (req, res) => {
  try {
    const foundCase = await Case.findOne({ _id: req.params.id, officeId: req.user.officeId });
    if (!foundCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    foundCase.status = 'archived';
    await foundCase.save();

    await logAction({
      userId: req.user.id,
      officeId: req.user.officeId,
      action: 'ARCHIVE_CASE',
      resourceType: 'Case',
      resourceId: foundCase._id,
    });

    res.json({ message: 'Case archived' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createCase, getCases, searchCases, getCaseById, updateCase, archiveCase };