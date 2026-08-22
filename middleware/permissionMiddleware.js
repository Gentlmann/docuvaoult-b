const levels = { none: 0, read: 1, write: 2 };

const checkPermission = (resource, requiredLevel) => {
  return (req, res, next) => {
    if (req.user.role !== 'staff') {
      return next();
    }

    const userLevel = req.user.permissions?.[resource] || 'none';

    if (levels[userLevel] < levels[requiredLevel]) {
      return res.status(403).json({
        message: `You don't have ${requiredLevel} access to ${resource}`,
      });
    }

    next();
  };
};

module.exports = checkPermission;