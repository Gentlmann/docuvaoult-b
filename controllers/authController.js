const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { logAction } = require('../services/auditService');

// Register - used to create Super Admin manually, or Office Admin creates Staff
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, officeId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      officeId: officeId || null,
    });

    const token = generateToken(user);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, officeId: user.officeId },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      await logAction({
        userId: null,
        officeId: null,
        action: 'LOGIN_FAILED',
        resourceType: 'User',
        metadata: { email, reason: 'User not found' },
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAction({
        userId: user._id,
        officeId: user.officeId,
        action: 'LOGIN_FAILED',
        resourceType: 'User',
        resourceId: user._id,
        metadata: { email, reason: 'Wrong password' },
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    await logAction({
      userId: user._id,
      officeId: user.officeId,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user._id,
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, officeId: user.officeId, permissions: user.permissions },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser };