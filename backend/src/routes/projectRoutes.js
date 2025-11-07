import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Project, Screenshot, Template } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/projects
 * Get all projects for current user
 */
router.get(
  '/',
  [
    query('status').optional().isIn(['active', 'archived', 'deleted']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      status = 'active',
      page = 1,
      limit = 20,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {
      userId: req.userId,
      status
    };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: projects } = await Project.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastEditedAt', 'DESC']],
      include: [
        {
          model: Template,
          as: 'template',
          attributes: ['id', 'name', 'thumbnailUrl']
        }
      ]
    });

    res.json({
      projects,
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
 * GET /api/projects/:id
 * Get project by ID
 */
router.get(
  '/:id',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: [
        {
          model: Screenshot,
          as: 'screenshots',
          order: [['order', 'ASC']]
        },
        {
          model: Template,
          as: 'template'
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  })
);

/**
 * POST /api/projects
 * Create new project
 */
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 255 }),
    body('description').optional().trim(),
    body('templateId').optional().isUUID(),
    body('settings').optional().isObject()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, templateId, settings } = req.body;

    const project = await Project.create({
      userId: req.userId,
      name,
      description,
      templateId,
      settings: settings || undefined,
      lastEditedAt: new Date()
    });

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  })
);

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().trim(),
    body('templateId').optional().isUUID(),
    body('settings').optional().isObject(),
    body('status').optional().isIn(['active', 'archived'])
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { name, description, templateId, settings, status } = req.body;

    await project.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(templateId !== undefined && { templateId }),
      ...(settings && { settings }),
      ...(status && { status }),
      lastEditedAt: new Date(),
      version: project.version + 1
    });

    res.json({
      message: 'Project updated successfully',
      project
    });
  })
);

/**
 * DELETE /api/projects/:id
 * Delete project (soft delete)
 */
router.delete(
  '/:id',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Soft delete
    await project.update({
      status: 'deleted'
    });

    res.json({
      message: 'Project deleted successfully'
    });
  })
);

/**
 * POST /api/projects/:id/duplicate
 * Duplicate project
 */
router.post(
  '/:id/duplicate',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const originalProject = await Project.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: [
        {
          model: Screenshot,
          as: 'screenshots'
        }
      ]
    });

    if (!originalProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create duplicate project
    const duplicateProject = await Project.create({
      userId: req.userId,
      name: `${originalProject.name} (Copy)`,
      description: originalProject.description,
      templateId: originalProject.templateId,
      settings: originalProject.settings,
      lastEditedAt: new Date()
    });

    // Duplicate screenshots
    for (const screenshot of originalProject.screenshots) {
      await Screenshot.create({
        projectId: duplicateProject.id,
        userId: req.userId,
        name: screenshot.name,
        originalImageUrl: screenshot.originalImageUrl,
        config: screenshot.config,
        order: screenshot.order
      });
    }

    res.status(201).json({
      message: 'Project duplicated successfully',
      project: duplicateProject
    });
  })
);

/**
 * GET /api/projects/:id/export-history
 * Get export history for project
 */
router.get(
  '/:id/export-history',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { ExportJob } = await import('../models/index.js');

    const exportJobs = await ExportJob.findAll({
      where: {
        projectId: req.params.id,
        userId: req.userId
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ exportJobs });
  })
);

export default router;
