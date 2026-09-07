const jwt = require('jsonwebtoken');
const config = require('../config/env');
const userRepository = require('../repositories/UserRepository');
const { UnauthorizedError, ForbiddenError } = require('../utils/customErrors');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new UnauthorizedError('Access token is missing or malformed', 'TOKEN_MISSING'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Authentication token has expired', 'TOKEN_EXPIRED'));
      }
      return next(new UnauthorizedError('Invalid authentication token', 'INVALID_TOKEN'));
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return next(new UnauthorizedError('User associated with token no longer exists', 'USER_NOT_FOUND'));
    }

    if (!user.isActive) {
      return next(new ForbiddenError('Your account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED'));
    }

    // Check token version to invalidate sessions after password reset
    const userVersion = user.tokenVersion !== undefined ? user.tokenVersion : 0;
    const tokenVersion = decoded.tokenVersion !== undefined ? decoded.tokenVersion : 0;
    if (tokenVersion !== userVersion) {
      return next(new UnauthorizedError('Session has been revoked or expired due to a password change. Please login again.', 'SESSION_REVOKED'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required prior to authorization', 'UNAUTHENTICATED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `User role '${req.user.role}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`,
          'ROLE_UNAUTHORIZED'
        )
      );
    }

    next();
  };
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await userRepository.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Ignore token errors for optional auth
      }
    }
    next();
  } catch (err) {
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuthenticate
};
