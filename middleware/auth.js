const jwt = require('jsonwebtoken');
const { User, ROLES } = require('../models/User');

// Middleware to authenticate user using JWT
const authenticate = async (req, res, next) => {
  try {
    // Get token from header, cookie, or query parameter
    const token = 
      req.headers.authorization?.split(' ')[1] || 
      req.cookies?.token ||
      req.query?.token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    
    if (!user.isApproved) {
      return res.status(403).json({ success: false, message: 'Your account is pending approval.' });
    }
    
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
    }
    
    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();
    
    // Add user to request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
};

// Middleware to check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }
    
    const hasRole = roles.some(role => req.user.hasPermission(role));
    
    if (!hasRole) {
      return res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });
    }
    
    next();
  };
};

// Middleware to check if user is a super admin
const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }
  
  if (req.user.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({ success: false, message: 'Super Admin access required.' });
  }
  
  next();
};

// Middleware to check if user is an admin or super admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }
  
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  
  next();
};

// Middleware to check if user is a teacher, class teacher, or admin
const isTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }
  
  if (
    req.user.role !== ROLES.SUPER_ADMIN && 
    req.user.role !== ROLES.ADMIN && 
    req.user.role !== ROLES.TEACHER && 
    req.user.role !== ROLES.CLASS_TEACHER
  ) {
    return res.status(403).json({ success: false, message: 'Teacher access required.' });
  }
  
  next();
};

// Middleware to check if user is a class officer (president, vice president, treasurer, secretary)
const isClassOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }
  
  if (
    req.user.role !== ROLES.CLASS_PRESIDENT && 
    req.user.role !== ROLES.VICE_PRESIDENT && 
    req.user.role !== ROLES.TREASURER && 
    req.user.role !== ROLES.SECRETARY
  ) {
    return res.status(403).json({ success: false, message: 'Class officer access required.' });
  }
  
  next();
};

// Middleware to check if user belongs to a specific class
const belongsToClass = (classIdParam = 'classId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }
    
    const classId = req.params[classIdParam] || req.body[classIdParam];
    
    if (!classId) {
      return res.status(400).json({ success: false, message: 'Class ID is required.' });
    }
    
    // Super admin and admin can access any class
    if (req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.ADMIN) {
      return next();
    }
    
    // Check if user belongs to the specified class
    if (!req.user.class || req.user.class.toString() !== classId) {
      return res.status(403).json({ success: false, message: 'You do not have access to this class.' });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  isSuperAdmin,
  isAdmin,
  isTeacher,
  isClassOfficer,
  belongsToClass,
  ROLES
};

