import authService from '../services/authService.js';
import { User } from '../models/index.js';

/**
 * Authenticate JWT token from request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    // Attach user to request
    req.user = user.toJSON();
    req.userId = user.id;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);

      const user = await User.findByPk(decoded.id);

      if (user) {
        req.user = user.toJSON();
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Check if user has required role
 * @param {Array<string>} roles - Required roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource
 */
export const checkOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // Admin can access all resources
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if resource belongs to user
    const resourceUserId = req.params[resourceUserIdField] ||
                          req.body[resourceUserIdField] ||
                          req.query[resourceUserIdField];

    if (resourceUserId && resourceUserId !== req.userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    next();
  };
};

/**
 * Check storage quota
 */
export const checkStorageQuota = (requiredSpace = 0) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    const availableSpace = user.storageLimit - user.storageUsed;

    if (requiredSpace > availableSpace) {
      return res.status(413).json({
        error: 'Storage quota exceeded',
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        availableSpace
      });
    }

    req.availableSpace = availableSpace;
    next();
  };
};

/**
 * Check if user email is verified
 */
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      error: 'Email verification required'
    });
  }

  next();
};

/**
 * Check premium features access
 */
export const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'premium' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Premium subscription required'
    });
  }

  next();
};
