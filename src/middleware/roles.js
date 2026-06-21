const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated',
        data: null
      });
    }

    const { role } = req.user;

    // SUPER_ADMIN has master bypass access
    if (role === 'SUPER_ADMIN') {
      return next();
    }

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: Access denied for this user role',
      data: null
    });
  };
};

module.exports = { checkRole };
