const jwt = require('jsonwebtoken');
const Banker = require('../models/Banker');

const protectBanker = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.banker = await Banker.findById(decoded.id).select('-password');

      if (!req.banker) {
        return res.status(401).json({ success: false, message: 'Banker not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.banker.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role ${req.banker.role} not authorized` 
      });
    }
    next();
  };
};

const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.banker.permissions.includes(permission)) {
      return res.status(403).json({ 
        success: false, 
        message: `Permission ${permission} required` 
      });
    }
    next();
  };
};

module.exports = { protectBanker, authorize, hasPermission };