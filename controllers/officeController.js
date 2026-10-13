const fs = require('fs');
const path = require('path');
const Office = require('../models/Office');
const Client = require('../models/Client');
const User = require('../models/User');
const { getDefaultQuotaForPlan } = require('../utils/planQuotas');
const { logAction } = require('../services/auditService');

const createOffice = async (req, res) => {
  try {
    const { name, officeType, subscriptionPlan, storageQuotaMB } = req.body;

    const finalQuota = storageQuotaMB || getDefaultQuotaForPlan(subscriptionPlan || 'basic');

    const office = await Office.create({
      name,
      officeType,
      subscriptionPlan,
      storageQuotaMB: finalQuota,
    });

    res.status(201).json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOffices = async (req, res) => {
  try {
    const offices = await Office.find();
    res.json(offices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOfficeClients = async (req, res) => {
  try {
    const { officeId } = req.params;
    const clients = await Client.find({ officeId, isArchived: false });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOffice = async (req, res) => {
  try {
    const { name, officeType, subscriptionPlan, storageQuotaMB } = req.body;
    const office = await Office.findById(req.params.id);
    if (!office) return res.status(404).json({ message: 'Office not found' });

    const planChanged = subscriptionPlan && subscriptionPlan !== office.subscriptionPlan;

    office.name = name ?? office.name;
    office.officeType = officeType ?? office.officeType;
    office.subscriptionPlan = subscriptionPlan ?? office.subscriptionPlan;

    if (storageQuotaMB) {
      office.storageQuotaMB = storageQuotaMB;
    } else if (planChanged) {
      office.storageQuotaMB = getDefaultQuotaForPlan(subscriptionPlan);
    }

    const updatedOffice = await office.save();
    res.json(updatedOffice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const suspendOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) return res.status(404).json({ message: 'Office not found' });
    office.status = 'suspended';
    await office.save();
    res.json({ message: 'Office suspended' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const activateOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) return res.status(404).json({ message: 'Office not found' });
    office.status = 'active';
    await office.save();
    res.json({ message: 'Office activated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Super Admin approves a pending (or previously rejected) registration
const approveOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) return res.status(404).json({ message: 'Office not found' });

    if (office.status !== 'pending' && office.status !== 'rejected') {
      return res.status(400).json({ message: 'Only pending or rejected registrations can be approved' });
    }

    office.status = 'active';
    office.rejectionReason = null;
    office.reviewedAt = new Date();
    await office.save();

    await logAction({
      userId: req.user.id,
      officeId: office._id,
      action: 'OFFICE_APPROVED',
      resourceType: 'Office',
      resourceId: office._id,
      metadata: { officeName: office.name },
    });

    res.json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Super Admin rejects a pending registration — a reason is required
const rejectOffice = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'A rejection reason is required' });
    }

    const office = await Office.findById(req.params.id);
    if (!office) return res.status(404).json({ message: 'Office not found' });

    if (office.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending registrations can be rejected' });
    }

    office.status = 'rejected';
    office.rejectionReason = reason.trim();
    office.reviewedAt = new Date();
    await office.save();

    await logAction({
      userId: req.user.id,
      officeId: office._id,
      action: 'OFFICE_REJECTED',
      resourceType: 'Office',
      resourceId: office._id,
      metadata: { officeName: office.name, reason: reason.trim() },
    });

    res.json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.user.officeId);
    if (!office) return res.status(404).json({ message: 'Office not found' });
    res.json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateMyOffice = async (req, res) => {
  try {
    const { name } = req.body;
    const office = await Office.findById(req.user.officeId);
    if (!office) return res.status(404).json({ message: 'Office not found' });
    if (name) office.name = name;
    await office.save();
    res.json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadOfficeLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No logo file uploaded' });

    const office = await Office.findById(req.user.officeId);
    if (!office) return res.status(404).json({ message: 'Office not found' });

    if (office.logoKey) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'logos', office.logoKey);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    office.logoKey = req.file.filename;
    await office.save();
    res.json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) return res.status(404).json({ message: 'Office not found' });

    // An office that never went live has no real data — remove its admin account too,
    // otherwise that email could never register again.
    if (office.status === 'pending' || office.status === 'rejected') {
      await User.deleteMany({ officeId: office._id, role: 'office_admin' });
    }

    await Office.deleteOne({ _id: office._id });

    res.json({ message: 'Office permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOffice,
  getOffices,
  getOfficeClients,
  updateOffice,
  suspendOffice,
  activateOffice,
  approveOffice,
  rejectOffice,
  getMyOffice,
  updateMyOffice,
  uploadOfficeLogo,
  deleteOffice,
};