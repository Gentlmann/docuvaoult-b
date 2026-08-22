const Office = require('../models/Office');
const Client = require('../models/Client');
const { getDefaultQuotaForPlan } = require('../utils/planQuotas');

// Super Admin creates a new office
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

// Super Admin views all offices
const getOffices = async (req, res) => {
  try {
    const offices = await Office.find();
    res.json(offices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Super Admin views clients in a SPECIFIC office — ONLY with an active grant
const getOfficeClients = async (req, res) => {
  try {
    const { officeId } = req.params;
    const clients = await Client.find({ officeId, isArchived: false });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update office details
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
      // Explicit value from the form always wins
      office.storageQuotaMB = storageQuotaMB;
    } else if (planChanged) {
      // No explicit quota given, but plan changed — apply new plan's default
      office.storageQuotaMB = getDefaultQuotaForPlan(subscriptionPlan);
    }

    const updatedOffice = await office.save();
    res.json(updatedOffice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Suspend an office
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

// Reactivate a suspended office
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

// Office Admin views their OWN office
const getMyOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.user.officeId);
    if (!office) return res.status(404).json({ message: 'Office not found' });
    res.json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Office Admin updates their OWN office's name
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

// Office Admin uploads a logo for their OWN office
const fs = require('fs');
const path = require('path');

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

module.exports = {
  createOffice,
  getOffices,
  getOfficeClients,
  updateOffice,
  suspendOffice,
  activateOffice,
  getMyOffice,
  updateMyOffice,
  uploadOfficeLogo,
};