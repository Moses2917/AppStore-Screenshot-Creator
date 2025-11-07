import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

class AuthService {
  /**
   * Generate JWT access token
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN
      }
    );
  }

  /**
   * Generate refresh token
   * @param {Object} user - User object
   * @returns {string} - Refresh token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        type: 'refresh'
      },
      JWT_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
      }
    );
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Created user and tokens
   */
  async register(userData) {
    const { email, password, username, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check if username is taken
    const existingUsername = await User.findOne({
      where: { username }
    });

    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      username,
      firstName,
      lastName
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User and tokens
   */
  async login(email, password) {
    // Find user
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await user.update({
      lastLoginAt: new Date()
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      return {
        accessToken
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User object
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user.toJSON();
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Only allow updating specific fields
    const allowedFields = ['firstName', 'lastName', 'username', 'settings'];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    await user.update(filteredData);

    return user.toJSON();
  }

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await user.validatePassword(currentPassword);

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await user.update({
      password: newPassword
    });
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<string>} - Reset token
   */
  async requestPasswordReset(email) {
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists
      throw new Error('If the email exists, a reset link will be sent');
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      {
        id: user.id,
        type: 'reset',
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    return resetToken;
  }

  /**
   * Reset password with token
   * @param {string} resetToken - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async resetPassword(resetToken, newPassword) {
    try {
      const decoded = this.verifyToken(resetToken);

      if (decoded.type !== 'reset') {
        throw new Error('Invalid reset token');
      }

      const user = await User.findByPk(decoded.id);

      if (!user || user.email !== decoded.email) {
        throw new Error('Invalid reset token');
      }

      // Update password
      await user.update({
        password: newPassword
      });
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  /**
   * Verify email
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async verifyEmail(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    await user.update({
      isEmailVerified: true
    });
  }

  /**
   * Delete account
   * @param {string} userId - User ID
   * @param {string} password - User password for confirmation
   * @returns {Promise<void>}
   */
  async deleteAccount(userId, password) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Delete user (cascade will delete related data)
    await user.destroy();
  }
}

export default new AuthService();
