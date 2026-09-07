const crypto = require('crypto');
const userRepository = require('../repositories/UserRepository');
const fresherRepository = require('../repositories/FresherRepository');
const companyRepository = require('../repositories/CompanyRepository');
const { ROLES } = require('../utils/constants');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError
} = require('../utils/customErrors');

class AuthService {
  async register(data) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const role = data.role || ROLES.FRESHER;
    if (role === ROLES.ADMIN) {
      throw new BadRequestError('Admin accounts cannot be created via public registration', 'ADMIN_REGISTRATION_FORBIDDEN');
    }
    if (![ROLES.FRESHER, ROLES.STARTUP].includes(role)) {
      throw new BadRequestError('Invalid user role specified', 'INVALID_ROLE');
    }

    // Create User
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role
    });

    let profile = null;

    // Automatically create domain profile based on role
    if (role === ROLES.FRESHER) {
      profile = await fresherRepository.create({
        user: user._id,
        fullName: user.name,
        email: user.email,
        location: data.location || ''
      });
    } else if (role === ROLES.STARTUP) {
      profile = await companyRepository.create({
        user: user._id,
        companyName: data.companyName || `${data.name}'s Company`,
        industry: data.industry || 'Technology',
        location: data.location || 'Remote',
        description: 'New Startup on CareerPilot'
      });
    }

    const token = user.generateAuthToken();

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      profile
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED');
    }

    const token = user.generateAuthToken();

    let profile = null;
    if (user.role === ROLES.FRESHER) {
      profile = await fresherRepository.findByUserId(user._id, false);
    } else if (user.role === ROLES.STARTUP) {
      profile = await companyRepository.findByUserId(user._id);
    }

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      profile
    };
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    let profile = null;
    if (user.role === ROLES.FRESHER) {
      profile = await fresherRepository.findByUserId(user._id, false);
    } else if (user.role === ROLES.STARTUP) {
      profile = await companyRepository.findByUserId(user._id);
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      profile
    };
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return generic message to prevent email enumeration
      return { message: 'If an account with that email exists, password reset instructions have been generated.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await userRepository.updateById(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    // Never return the reset token directly to the public response
    return {
      message: 'If an account with that email exists, password reset instructions have been generated.'
    };
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired', 'INVALID_RESET_TOKEN');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    // Invalidate all prior sessions/tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const authToken = user.generateAuthToken();

    return {
      message: 'Password has been reset successfully',
      token: authToken
    };
  }
}

module.exports = new AuthService();
