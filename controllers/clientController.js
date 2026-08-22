const Client = require('../models/Client');
const { logAction } = require('../services/auditService');

// Create a client — scoped to the logged-in user's office
const createClient = async (req, res) => {
  try {
    const { fullName, phone, email, address, notes } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    const client = await Client.create({
      fullName,
      phone,
      email,
      address,
      notes,
      officeId: req.user.officeId,
      createdBy: req.user.id,
    });

    await logAction({
      userId: req.user.id,
      officeId: req.user.officeId,
      action: 'CREATE_CLIENT',
      resourceType: 'Client',
      resourceId: client._id,
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all clients — ONLY for the logged-in user's office
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({
      officeId: req.user.officeId,
      isArchived: false,
    }).sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search/filter clients within the office
const searchClients = async (req, res) => {
  try {
    const { name, phone, email, sortBy, order, page, limit } = req.query;

    const query = {
      officeId: req.user.officeId,
      isArchived: false,
    };

    if (name) {
      query.fullName = { $regex: name, $options: 'i' };
    }
    if (phone) {
      query.phone = { $regex: phone, $options: 'i' };
    }
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const clients = await Client.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    const total = await Client.countDocuments(query);

    res.json({
      clients,
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

// Get single client by ID — but ONLY if it belongs to the user's office
const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update client — scoped the same way
const updateClient = async (req, res) => {
  try {
    const { fullName, phone, email, address, notes } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.fullName = fullName ?? client.fullName;
    client.phone = phone ?? client.phone;
    client.email = email ?? client.email;
    client.address = address ?? client.address;
    client.notes = notes ?? client.notes;

    const updatedClient = await client.save();

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Archive (soft delete) a client — never hard-delete real business records
const archiveClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.isArchived = true;
    await client.save();

    await logAction({
      userId: req.user.id,
      officeId: req.user.officeId,
      action: 'ARCHIVE_CLIENT',
      resourceType: 'Client',
      resourceId: client._id,
    });

    res.json({ message: 'Client archived' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createClient, getClients, searchClients, getClientById, updateClient, archiveClient };