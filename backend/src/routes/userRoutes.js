import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { User, Project, Screenshot, ExportJob } from '../models/index.js';
import authService from '../services/authService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  })
);

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put(
  '/profile',
  [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('username').optional().trim().isLength({ min: 3, max: 30 }),
    body('settings').optional().isObject()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updatedUser = await authService.updateProfile(req.userId, req.body);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  })
);

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [projectCount, screenshotCount, exportJobCount, user] = await Promise.all([
      Project.count({
        where: {
          userId: req.userId,
          status: 'active'
        }
      }),
      Screenshot.count({
        where: {
          userId: req.userId,
          status: 'ready'
        }
      }),
      ExportJob.count({
        where: {
          userId: req.userId,
          status: 'completed'
        }
      }),
      User.findByPk(req.userId, {
        attributes: ['storageUsed', 'storageLimit']
      })
    ]);

    const storageUsagePercentage = (user.storageUsed / user.storageLimit) * 100;

    res.json({
      stats: {
        projectCount,
        screenshotCount,
        exportJobCount,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        storageUsagePercentage: Math.round(storageUsagePercentage * 100) / 100,
        storageAvailable: user.storageLimit - user.storageUsed
      }
    });
  })
);

/**
 * GET /api/users/activity
 * Get recent user activity
 */
router.get(
  '/activity',
  asyncHandler(async (req, res) => {
    const [recentProjects, recentScreenshots, recentExports] = await Promise.all([
      Project.findAll({
        where: { userId: req.userId },
        order: [['lastEditedAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'lastEditedAt', 'screenshotCount']
      }),
      Screenshot.findAll({
        where: { userId: req.userId },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'thumbnailUrl', 'createdAt']
      }),
      ExportJob.findAll({
        where: { userId: req.userId },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'status', 'exportType', 'createdAt', 'completedAt']
      })
    ]);

    res.json({
      activity: {
        recentProjects,
        recentScreenshots,
        recentExports
      }
    });
  })
);

/**
 * POST /api/users/verify-email
 * Request email verification
 */
router.post(
  '/verify-email',
  asyncHandler(async (req, res) => {
    await authService.verifyEmail(req.userId);

    res.json({
      message: 'Email verified successfully'
    });
  })
);

/**
 * DELETE /api/users/account
 * Delete user account
 */
router.delete(
  '/account',
  [body('password').notEmpty()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;

    await authService.deleteAccount(req.userId, password);

    res.json({
      message: 'Account deleted successfully'
    });
  })
);

/**
 * GET /api/users/storage
 * Get detailed storage breakdown
 */
router.get(
  '/storage',
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.userId);

    const screenshots = await Screenshot.findAll({
      where: { userId: req.userId },
      attributes: ['id', 'name', 'fileSize', 'createdAt']
    });

    const storageByProject = await Screenshot.findAll({
      where: { userId: req.userId },
      attributes: [
        'projectId',
        [sequelize.fn('SUM', sequelize.col('file_size')), 'totalSize'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['projectId'],
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['name']
        }
      ]
    });

    res.json({
      storage: {
        used: user.storageUsed,
        limit: user.storageLimit,
        available: user.storageLimit - user.storageUsed,
        percentage: (user.storageUsed / user.storageLimit) * 100,
        screenshotCount: screenshots.length,
        byProject: storageByProject.map(item => ({
          projectId: item.projectId,
          projectName: item.project?.name,
          size: item.get('totalSize'),
          count: item.get('count')
        }))
      }
    });
  })
);

/**
 * POST /api/users/upgrade
 * Upgrade to premium (placeholder for payment integration)
 */
router.post(
  '/upgrade',
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.userId);

    if (user.role === 'premium' || user.role === 'admin') {
      return res.status(400).json({ error: 'User already has premium access' });
    }

    // In production, integrate with payment processor (Stripe, etc.)
    // For now, just upgrade the user
    await user.update({
      role: 'premium',
      storageLimit: 100 * 1024 * 1024 * 1024 // 100GB
    });

    res.json({
      message: 'Upgraded to premium successfully',
      user: user.toJSON()
    });
  })
);

/**
 * Admin: GET /api/users
 * Get all users (admin only)
 */
router.get(
  '/',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({ users });
  })
);

/**
 * Admin: PUT /api/users/:id/role
 * Update user role (admin only)
 */
router.put(
  '/:id/role',
  authorize('admin'),
  [
    param('id').isUUID(),
    body('role').isIn(['user', 'premium', 'admin'])
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { role } = req.body;

    // Adjust storage limit based on role
    let storageLimit = user.storageLimit;
    if (role === 'premium' || role === 'admin') {
      storageLimit = 100 * 1024 * 1024 * 1024; // 100GB
    }

    await user.update({
      role,
      storageLimit
    });

    res.json({
      message: 'User role updated successfully',
      user: user.toJSON()
    });
  })
);

export default router;
