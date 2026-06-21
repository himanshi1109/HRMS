const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No Token Provided',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeychangeinproduction');
    req.user = decoded; // Contains: { userId, tenantId, role, email, employeeId }
    req.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or Expired Token',
      data: null
    });
  }
};

module.exports = { verifyToken };
