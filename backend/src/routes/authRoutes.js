import express from 'express';
import { body, validationResult } from 'express-validator';
import authService from '../services/authService.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user
 */
router.post(
  '/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('username').isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username, firstName, lastName } = req.body;

    const result = await authService.register({
      email,
      password,
      username,
      firstName,
      lastName
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  [body('refreshToken').notEmpty()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      accessToken: result.accessToken
    });
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.userId);

    res.json({
      user
    });
  })
);

/**
 * POST /api/auth/logout
 * Logout user (client should delete tokens)
 */
router.post('/logout', authenticate, (req, res) => {
  res.json({
    message: 'Logout successful'
  });
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.userId, currentPassword, newPassword);

    res.json({
      message: 'Password changed successfully'
    });
  })
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  [body('email').isEmail().normalizeEmail()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const resetToken = await authService.requestPasswordReset(email);

    // In production, send this via email
    res.json({
      message: 'Password reset instructions sent to email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  })
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  authRateLimiter,
  [
    body('resetToken').notEmpty(),
    body('newPassword').isLength({ min: 8 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resetToken, newPassword } = req.body;

    await authService.resetPassword(resetToken, newPassword);

    res.json({
      message: 'Password reset successfully'
    });
  })
);

export default router;
