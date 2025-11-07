import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate, optionalAuth, authorize, requirePremium } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Template } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * GET /api/templates
 * Get all templates (public + user's own)
 */
router.get(
  '/',
  optionalAuth,
  [
    query('category').optional().trim(),
    query('isPremium').optional().isBoolean(),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sortBy').optional().isIn(['usageCount', 'rating', 'createdAt'])
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category,
      isPremium,
      search,
      page = 1,
      limit = 20,
      sortBy = 'usageCount'
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {
      [Op.or]: [
        { isPublic: true },
        { isSystem: true },
        ...(req.userId ? [{ userId: req.userId }] : [])
      ]
    };

    if (category) {
      where.category = category;
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } }
      ];
    }

    const { count, rows: templates } = await Template.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, 'DESC']],
      attributes: { exclude: ['config'] } // Don't send full config in list
    });

    res.json({
      templates,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  })
);

/**
 * GET /api/templates/:id
 * Get template by ID with full config
 */
router.get(
  '/:id',
  optionalAuth,
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const template = await Template.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { isPublic: true },
          { isSystem: true },
          ...(req.userId ? [{ userId: req.userId }] : [])
        ]
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check premium access
    if (template.isPremium && req.user && req.user.role !== 'premium' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Premium subscription required' });
    }

    // Increment usage count
    await template.increment('usageCount');

    res.json({ template });
  })
);

/**
 * POST /api/templates
 * Create custom template
 */
router.post(
  '/',
  authenticate,
  [
    body('name').trim().isLength({ min: 1, max: 255 }),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('config').isObject(),
    body('tags').optional().isArray(),
    body('isPublic').optional().isBoolean()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, config, tags, isPublic } = req.body;

    const template = await Template.create({
      userId: req.userId,
      name,
      description,
      category,
      config,
      tags: tags || [],
      isPublic: isPublic || false,
      isSystem: false,
      isPremium: false
    });

    res.status(201).json({
      message: 'Template created successfully',
      template
    });
  })
);

/**
 * PUT /api/templates/:id
 * Update custom template
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('config').optional().isObject(),
    body('tags').optional().isArray(),
    body('isPublic').optional().isBoolean()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const template = await Template.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.isSystem) {
      return res.status(403).json({ error: 'Cannot modify system templates' });
    }

    const { name, description, category, config, tags, isPublic } = req.body;

    await template.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(config && { config }),
      ...(tags && { tags }),
      ...(isPublic !== undefined && { isPublic })
    });

    res.json({
      message: 'Template updated successfully',
      template
    });
  })
);

/**
 * DELETE /api/templates/:id
 * Delete custom template
 */
router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const template = await Template.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.isSystem) {
      return res.status(403).json({ error: 'Cannot delete system templates' });
    }

    await template.destroy();

    res.json({
      message: 'Template deleted successfully'
    });
  })
);

/**
 * GET /api/templates/categories
 * Get all template categories
 */
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await Template.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      where: {
        category: { [Op.ne]: null }
      },
      raw: true
    });

    res.json({
      categories: categories.map(c => c.category).filter(Boolean)
    });
  })
);

/**
 * POST /api/templates/:id/rate
 * Rate a template
 */
router.post(
  '/:id/rate',
  authenticate,
  [
    param('id').isUUID(),
    body('rating').isInt({ min: 1, max: 5 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const template = await Template.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const { rating } = req.body;

    // Calculate new rating (simple average)
    const newRatingCount = template.ratingCount + 1;
    const newRating = ((template.rating * template.ratingCount) + rating) / newRatingCount;

    await template.update({
      rating: newRating,
      ratingCount: newRatingCount
    });

    res.json({
      message: 'Rating submitted successfully',
      rating: newRating,
      ratingCount: newRatingCount
    });
  })
);

export default router;
