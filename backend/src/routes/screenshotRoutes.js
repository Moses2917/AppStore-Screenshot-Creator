import express from 'express';
import multer from 'multer';
import { body, param, validationResult } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Screenshot, Project, User } from '../models/index.js';
import storageService from '../services/storageService.js';
import { addImageProcessingJob } from '../services/queueService.js';
import config from '../config/config.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFiles
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/screenshots/upload
 * Upload screenshot(s)
 */
router.post(
  '/upload',
  uploadRateLimiter,
  upload.array('images', config.upload.maxFiles),
  [
    body('projectId').isUUID()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { projectId } = req.body;

    // Verify project ownership
    const project = await Project.findOne({
      where: {
        id: projectId,
        userId: req.userId
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check storage quota
    const user = await User.findByPk(req.userId);
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    const availableSpace = user.storageLimit - user.storageUsed;

    if (totalSize > availableSpace) {
      return res.status(413).json({
        error: 'Storage quota exceeded',
        required: totalSize,
        available: availableSpace
      });
    }

    const screenshots = [];

    // Upload each file
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Upload to storage
      const fileName = `${Date.now()}_${file.originalname}`;
      const uploadPath = `uploads/${req.userId}/${projectId}/${fileName}`;
      const uploadedUrl = await storageService.uploadFile(file.buffer, uploadPath, {
        contentType: file.mimetype
      });

      // Create screenshot record
      const screenshot = await Screenshot.create({
        projectId,
        userId: req.userId,
        name: file.originalname,
        originalImageUrl: uploadedUrl,
        imageMetadata: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size
        },
        fileSize: file.size,
        order: i,
        status: 'processing'
      });

      // Queue image processing job
      await addImageProcessingJob({
        screenshotId: screenshot.id,
        userId: req.userId,
        imageBuffer: file.buffer,
        operations: {
          generateThumbnail: true,
          optimize: {
            format: 'png',
            quality: 90
          }
        }
      });

      screenshots.push(screenshot);
    }

    // Update user storage
    await user.update({
      storageUsed: user.storageUsed + totalSize
    });

    // Update project
    await project.update({
      screenshotCount: project.screenshotCount + screenshots.length,
      lastEditedAt: new Date()
    });

    res.status(201).json({
      message: 'Screenshots uploaded successfully',
      screenshots
    });
  })
);

/**
 * GET /api/screenshots/:id
 * Get screenshot by ID
 */
router.get(
  '/:id',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const screenshot = await Screenshot.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    res.json({ screenshot });
  })
);

/**
 * PUT /api/screenshots/:id
 * Update screenshot configuration
 */
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim(),
    body('config').optional().isObject(),
    body('order').optional().isInt()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const screenshot = await Screenshot.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    const { name, config, order } = req.body;

    await screenshot.update({
      ...(name && { name }),
      ...(config && { config }),
      ...(order !== undefined && { order })
    });

    // Update project last edited time
    await Project.update(
      { lastEditedAt: new Date() },
      { where: { id: screenshot.projectId } }
    );

    res.json({
      message: 'Screenshot updated successfully',
      screenshot
    });
  })
);

/**
 * DELETE /api/screenshots/:id
 * Delete screenshot
 */
router.delete(
  '/:id',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const screenshot = await Screenshot.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    // Delete files from storage
    const filesToDelete = [screenshot.originalImageUrl];
    if (screenshot.processedImageUrl) {
      filesToDelete.push(screenshot.processedImageUrl);
    }
    if (screenshot.thumbnailUrl) {
      filesToDelete.push(screenshot.thumbnailUrl);
    }

    await storageService.deleteFiles(filesToDelete);

    // Update user storage
    const user = await User.findByPk(req.userId);
    await user.update({
      storageUsed: Math.max(0, user.storageUsed - screenshot.fileSize)
    });

    // Update project
    const project = await Project.findByPk(screenshot.projectId);
    if (project) {
      await project.update({
        screenshotCount: Math.max(0, project.screenshotCount - 1),
        lastEditedAt: new Date()
      });
    }

    // Delete screenshot record
    await screenshot.destroy();

    res.json({
      message: 'Screenshot deleted successfully'
    });
  })
);

/**
 * POST /api/screenshots/:id/duplicate
 * Duplicate screenshot
 */
router.post(
  '/:id/duplicate',
  [param('id').isUUID()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const originalScreenshot = await Screenshot.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!originalScreenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    // Check storage quota
    const user = await User.findByPk(req.userId);
    const availableSpace = user.storageLimit - user.storageUsed;

    if (originalScreenshot.fileSize > availableSpace) {
      return res.status(413).json({
        error: 'Storage quota exceeded'
      });
    }

    // Create duplicate
    const duplicateScreenshot = await Screenshot.create({
      projectId: originalScreenshot.projectId,
      userId: req.userId,
      name: `${originalScreenshot.name} (Copy)`,
      originalImageUrl: originalScreenshot.originalImageUrl,
      processedImageUrl: originalScreenshot.processedImageUrl,
      thumbnailUrl: originalScreenshot.thumbnailUrl,
      imageMetadata: originalScreenshot.imageMetadata,
      config: originalScreenshot.config,
      order: originalScreenshot.order + 1,
      fileSize: originalScreenshot.fileSize,
      status: originalScreenshot.status
    });

    // Update project
    const project = await Project.findByPk(originalScreenshot.projectId);
    if (project) {
      await project.update({
        screenshotCount: project.screenshotCount + 1,
        lastEditedAt: new Date()
      });
    }

    res.status(201).json({
      message: 'Screenshot duplicated successfully',
      screenshot: duplicateScreenshot
    });
  })
);

/**
 * POST /api/screenshots/reorder
 * Reorder screenshots
 */
router.post(
  '/reorder',
  [
    body('projectId').isUUID(),
    body('screenshotIds').isArray()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, screenshotIds } = req.body;

    // Verify project ownership
    const project = await Project.findOne({
      where: {
        id: projectId,
        userId: req.userId
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update order for each screenshot
    for (let i = 0; i < screenshotIds.length; i++) {
      await Screenshot.update(
        { order: i },
        {
          where: {
            id: screenshotIds[i],
            userId: req.userId,
            projectId
          }
        }
      );
    }

    res.json({
      message: 'Screenshots reordered successfully'
    });
  })
);

export default router;
