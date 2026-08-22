const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Office = require('../models/Office');

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Not authorized, user not found or inactive' });
    }

    if (user.officeId) {
      const office = await Office.findById(user.officeId);
      if (!office || office.status === 'suspended') {
        return res.status(401).json({ message: 'Your office access has been suspended' });
      }
    }

    req.user = {
      id: user._id,
      role: user.role,
      officeId: user.officeId,
      permissions: user.permissions,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };