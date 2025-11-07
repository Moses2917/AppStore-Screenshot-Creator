import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware.js';
import { exportRateLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ExportJob, Screenshot, Project } from '../models/index.js';
import { addExportJob, getJobStatus, cancelJob } from '../services/queueService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/exports
 * Create new export job
 */
router.post(
  '/',
  exportRateLimiter,
  [
    body('screenshotIds').isArray().notEmpty(),
    body('exportType').isIn(['single', 'batch', 'project']),
    body('exportSettings').isObject(),
    body('exportSettings.format').isIn(['png', 'jpg', 'jpeg']),
    body('exportSettings.quality').optional().isInt({ min: 1, max: 100 }),
    body('exportSettings.width').isInt({ min: 1 }),
    body('exportSettings.height').isInt({ min: 1 }),
    body('exportSettings.scale').optional().isInt({ min: 1, max: 3 }),
    body('exportPreset').optional().trim(),
    body('projectId').optional().isUUID()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      screenshotIds,
      exportType,
      exportSettings,
      exportPreset,
      projectId
    } = req.body;

    // Verify all screenshots belong to user
    const screenshots = await Screenshot.findAll({
      where: {
        id: screenshotIds,
        userId: req.userId
      }
    });

    if (screenshots.length !== screenshotIds.length) {
      return res.status(404).json({ error: 'One or more screenshots not found' });
    }

    // Verify project if provided
    if (projectId) {
      const project = await Project.findOne({
        where: {
          id: projectId,
          userId: req.userId
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    // Create export job record
    const exportJobId = uuidv4();
    const exportJob = await ExportJob.create({
      id: exportJobId,
      userId: req.userId,
      projectId,
      screenshotIds,
      exportType,
      exportPreset,
      exportSettings: {
        format: exportSettings.format,
        quality: exportSettings.quality || 90,
        width: exportSettings.width,
        height: exportSettings.height,
        scale: exportSettings.scale || 2
      },
      status: 'pending'
    });

    // Add job to queue
    await addExportJob({
      exportJobId,
      userId: req.userId,
      projectId,
      screenshots: screenshots.map(s => ({
        id: s.id,
        config: s.config,
        originalImageUrl: s.originalImageUrl
      })),
      exportSettings: exportJob.exportSettings,
      exportType
    });

    res.status(201).json({
      message: 'Export job created successfully',
      exportJob: {
        id: exportJob.id,
        status: exportJob.status,
        progress: exportJob.progress
      }
    });
  })
);

/**
 * GET /api/exports/:id
 * Get export job status
 */
router.get(
  '/:id',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exportJob = await ExportJob.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!exportJob) {
      return res.status(404).json({ error: 'Export job not found' });
    }

    // Get latest status from queue if still processing
    if (exportJob.status === 'processing' || exportJob.status === 'pending') {
      const queueStatus = await getJobStatus(exportJob.id, 'export');
      if (queueStatus) {
        exportJob.progress = queueStatus.progress || exportJob.progress;
      }
    }

    res.json({ exportJob });
  })
);

/**
 * GET /api/exports
 * Get all export jobs for user
 */
router.get(
  '/',
  [
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      status,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {
      userId: req.userId
    };

    if (status) {
      where.status = status;
    }

    const { count, rows: exportJobs } = await ExportJob.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      exportJobs,
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
 * DELETE /api/exports/:id
 * Cancel export job
 */
router.delete(
  '/:id',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exportJob = await ExportJob.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!exportJob) {
      return res.status(404).json({ error: 'Export job not found' });
    }

    if (exportJob.status === 'completed' || exportJob.status === 'failed') {
      return res.status(400).json({ error: 'Cannot cancel completed or failed job' });
    }

    // Cancel job in queue
    await cancelJob(exportJob.id, 'export');

    // Update status
    await exportJob.update({
      status: 'cancelled'
    });

    res.json({
      message: 'Export job cancelled successfully'
    });
  })
);

/**
 * POST /api/exports/:id/retry
 * Retry failed export job
 */
router.post(
  '/:id/retry',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exportJob = await ExportJob.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!exportJob) {
      return res.status(404).json({ error: 'Export job not found' });
    }

    if (exportJob.status !== 'failed') {
      return res.status(400).json({ error: 'Can only retry failed jobs' });
    }

    // Get screenshots
    const screenshots = await Screenshot.findAll({
      where: {
        id: exportJob.screenshotIds,
        userId: req.userId
      }
    });

    // Reset job status
    await exportJob.update({
      status: 'pending',
      progress: 0,
      errorMessage: null,
      startedAt: null,
      completedAt: null
    });

    // Re-add to queue
    await addExportJob({
      exportJobId: exportJob.id,
      userId: req.userId,
      projectId: exportJob.projectId,
      screenshots: screenshots.map(s => ({
        id: s.id,
        config: s.config,
        originalImageUrl: s.originalImageUrl
      })),
      exportSettings: exportJob.exportSettings,
      exportType: exportJob.exportType
    });

    res.json({
      message: 'Export job queued for retry',
      exportJob: {
        id: exportJob.id,
        status: exportJob.status,
        progress: exportJob.progress
      }
    });
  })
);

/**
 * GET /api/exports/:id/download
 * Get download URL for completed export
 */
router.get(
  '/:id/download',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exportJob = await ExportJob.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!exportJob) {
      return res.status(404).json({ error: 'Export job not found' });
    }

    if (exportJob.status !== 'completed') {
      return res.status(400).json({ error: 'Export not completed yet' });
    }

    // Check if expired
    if (exportJob.expiresAt && new Date() > exportJob.expiresAt) {
      return res.status(410).json({ error: 'Export files have expired' });
    }

    res.json({
      resultUrls: exportJob.resultUrls,
      zipUrl: exportJob.zipUrl,
      expiresAt: exportJob.expiresAt
    });
  })
);

export default router;
