import { exportQueue, imageQueue } from '../services/queueService.js';
import imageProcessingService from '../services/imageProcessingService.js';
import storageService from '../services/storageService.js';
import { ExportJob, Screenshot } from '../models/index.js';
import { sequelize } from '../database/connection.js';
import dotenv from 'dotenv';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Process export jobs
 */
exportQueue.process(async (job) => {
  const { exportJobId, userId, projectId, screenshots, exportSettings, exportType } = job.data;

  console.log(`🔄 Processing export job ${exportJobId}`);

  try {
    // Update job status to processing
    await ExportJob.update(
      {
        status: 'processing',
        startedAt: new Date()
      },
      { where: { id: exportJobId } }
    );

    // Initialize image processing service
    await imageProcessingService.initialize();

    const resultUrls = [];
    const total = screenshots.length;

    // Process each screenshot
    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];

      // Update progress
      const progress = Math.round(((i + 1) / total) * 100);
      job.progress(progress);

      await ExportJob.update(
        { progress },
        { where: { id: exportJobId } }
      );

      // Get screenshot from database
      const screenshotRecord = await Screenshot.findByPk(screenshot.id);

      if (!screenshotRecord) {
        throw new Error(`Screenshot ${screenshot.id} not found`);
      }

      // Download original image
      const imageBuffer = await storageService.downloadFile(screenshotRecord.originalImageUrl);

      // Convert buffer to base64 data URL for rendering
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

      // Render screenshot with configuration
      const renderedBuffer = await imageProcessingService.renderScreenshot(
        screenshotRecord.config,
        base64Image,
        exportSettings
      );

      // Optimize the rendered image
      const optimizedBuffer = await imageProcessingService.optimizeImage(renderedBuffer, {
        format: exportSettings.format,
        quality: exportSettings.quality,
        width: exportSettings.width,
        height: exportSettings.height
      });

      // Upload to storage
      const fileName = `export_${exportJobId}_${i}.${exportSettings.format}`;
      const uploadPath = `exports/${userId}/${exportJobId}/${fileName}`;
      const uploadedUrl = await storageService.uploadFile(optimizedBuffer, uploadPath, {
        contentType: `image/${exportSettings.format}`
      });

      resultUrls.push(uploadedUrl);

      console.log(`✅ Processed screenshot ${i + 1}/${total}`);
    }

    // If batch export, create ZIP file
    let zipUrl = null;
    if (exportType === 'batch' || exportType === 'project') {
      zipUrl = await createZipArchive(exportJobId, userId, resultUrls);
    }

    // Calculate processing time
    const startedAt = await ExportJob.findByPk(exportJobId, { attributes: ['startedAt'] });
    const processingTime = Date.now() - new Date(startedAt.startedAt).getTime();

    // Set expiration time (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Update job as completed
    await ExportJob.update(
      {
        status: 'completed',
        progress: 100,
        resultUrls,
        zipUrl,
        processingTime,
        completedAt: new Date(),
        expiresAt
      },
      { where: { id: exportJobId } }
    );

    console.log(`✅ Export job ${exportJobId} completed in ${processingTime}ms`);

    return {
      success: true,
      exportJobId,
      resultUrls,
      zipUrl,
      processingTime
    };
  } catch (error) {
    console.error(`❌ Export job ${exportJobId} failed:`, error);

    // Update job as failed
    await ExportJob.update(
      {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date()
      },
      { where: { id: exportJobId } }
    );

    throw error;
  }
});

/**
 * Process image optimization jobs
 */
imageQueue.process(async (job) => {
  const { screenshotId, userId, imageBuffer, operations } = job.data;

  console.log(`🔄 Processing image job for screenshot ${screenshotId}`);

  try {
    let processedBuffer = imageBuffer;

    // Apply filters if specified
    if (operations.filters) {
      processedBuffer = await imageProcessingService.applyFilters(processedBuffer, operations.filters);
    }

    // Optimize image
    if (operations.optimize) {
      processedBuffer = await imageProcessingService.optimizeImage(processedBuffer, operations.optimize);
    }

    // Generate thumbnail
    let thumbnailUrl = null;
    if (operations.generateThumbnail) {
      const thumbnailBuffer = await imageProcessingService.generateThumbnail(processedBuffer);
      const thumbnailPath = `thumbnails/${userId}/${screenshotId}.jpg`;
      thumbnailUrl = await storageService.uploadFile(thumbnailBuffer, thumbnailPath, {
        contentType: 'image/jpeg'
      });
    }

    // Upload processed image
    const processedPath = `processed/${userId}/${screenshotId}.png`;
    const processedUrl = await storageService.uploadFile(processedBuffer, processedPath, {
      contentType: 'image/png'
    });

    // Update screenshot record
    await Screenshot.update(
      {
        processedImageUrl: processedUrl,
        thumbnailUrl,
        status: 'ready'
      },
      { where: { id: screenshotId } }
    );

    console.log(`✅ Image processing completed for screenshot ${screenshotId}`);

    return {
      success: true,
      screenshotId,
      processedUrl,
      thumbnailUrl
    };
  } catch (error) {
    console.error(`❌ Image processing failed for screenshot ${screenshotId}:`, error);

    // Update screenshot as failed
    await Screenshot.update(
      {
        status: 'failed',
        errorMessage: error.message
      },
      { where: { id: screenshotId } }
    );

    throw error;
  }
});

/**
 * Create ZIP archive of exported files
 * @param {string} exportJobId - Export job ID
 * @param {string} userId - User ID
 * @param {Array<string>} fileUrls - Array of file URLs
 * @returns {Promise<string>} - ZIP file URL
 */
async function createZipArchive(exportJobId, userId, fileUrls) {
  const tempDir = join(__dirname, '../../temp');
  const zipPath = join(tempDir, `export_${exportJobId}.zip`);

  // Create write stream
  const output = createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  return new Promise(async (resolve, reject) => {
    output.on('close', async () => {
      try {
        // Upload ZIP to storage
        const zipBuffer = await fs.readFile(zipPath);
        const uploadPath = `exports/${userId}/${exportJobId}/export.zip`;
        const zipUrl = await storageService.uploadFile(zipBuffer, uploadPath, {
          contentType: 'application/zip'
        });

        // Clean up temp file
        await fs.unlink(zipPath);

        resolve(zipUrl);
      } catch (error) {
        reject(error);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Download and add each file to archive
    for (let i = 0; i < fileUrls.length; i++) {
      const fileUrl = fileUrls[i];
      const fileBuffer = await storageService.downloadFile(fileUrl);
      const fileName = `screenshot_${i + 1}.${fileUrl.split('.').pop()}`;
      archive.append(fileBuffer, { name: fileName });
    }

    await archive.finalize();
  });
}

console.log('🚀 Export worker started');
console.log('👂 Listening for export jobs...');

// Keep the worker running
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down worker...');
  await exportQueue.close();
  await imageQueue.close();
  await imageProcessingService.close();
  process.exit(0);
});
