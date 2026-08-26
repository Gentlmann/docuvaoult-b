const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createStaff = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'staff',
      officeId: req.user.officeId,
      permissions: permissions || undefined,
    });

    res.status(201).json({
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      officeId: staff.officeId,
      permissions: staff.permissions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStaff = async (req, res) => {
  try {
    const staff = await User.find({
      officeId: req.user.officeId,
      role: 'staff',
    }).select('-password');

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
      role: 'staff',
    }).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { name, email, permissions } = req.body;

    const staff = await User.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
      role: 'staff',
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.name = name ?? staff.name;
    staff.email = email ?? staff.email;
    if (permissions) {
      staff.permissions = { ...staff.permissions.toObject(), ...permissions };
    }

    const updatedStaff = await staff.save();

    res.json({
      id: updatedStaff._id,
      name: updatedStaff.name,
      email: updatedStaff.email,
      permissions: updatedStaff.permissions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deactivateStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, officeId: req.user.officeId, role: 'staff' });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    staff.isActive = false;
    await staff.save();
    res.json({ message: 'Staff member deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const reactivateStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, officeId: req.user.officeId, role: 'staff' });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    staff.isActive = true;
    await staff.save();
    res.json({ message: 'Staff member reactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createOfficeAdmin = async (req, res) => {
  try {
    const { name, email, password, officeId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'office_admin',
      officeId,
    });

    res.status(201).json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      officeId: admin.officeId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const resetStaffPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const staff = await User.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
      role: 'staff',
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(newPassword, salt);
    await staff.save();

    res.json({ message: 'Staff password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const resetOfficeAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const admin = await User.findOne({ _id: req.params.id, role: 'office_admin' });

    if (!admin) {
      return res.status(404).json({ message: 'Office Admin not found' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ message: 'Office Admin password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      officeId: req.user.officeId,
      role: 'staff',
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await User.deleteOne({ _id: staff._id });

    res.json({ message: 'Staff member permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
module.exports = {
  createStaff,
  getStaff,
  getStaffById,
  resetStaffPassword,
  resetOfficeAdminPassword,

  updateStaff,
  deactivateStaff,
  reactivateStaff,
  createOfficeAdmin,
  deleteStaff,
};