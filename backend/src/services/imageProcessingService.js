import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ImageProcessingService {
  constructor() {
    this.browser = null;
    this.tempDir = join(__dirname, '../../temp');
  }

  /**
   * Initialize Puppeteer browser instance
   */
  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      console.log('✅ Puppeteer browser initialized');
    }

    // Ensure temp directory exists
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * Close Puppeteer browser instance
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('✅ Puppeteer browser closed');
    }
  }

  /**
   * Render screenshot with configuration using headless browser
   * @param {Object} config - Screenshot configuration
   * @param {string} imageUrl - URL or path to original image
   * @param {Object} exportSettings - Export settings (width, height, format, quality)
   * @returns {Promise<Buffer>} - Rendered image buffer
   */
  async renderScreenshot(config, imageUrl, exportSettings) {
    await this.initialize();

    const page = await this.browser.newPage();

    try {
      // Set viewport to export dimensions
      await page.setViewport({
        width: exportSettings.width || 1290,
        height: exportSettings.height || 2796,
        deviceScaleFactor: exportSettings.scale || 2
      });

      // Generate HTML for rendering
      const html = this.generateHTML(config, imageUrl, exportSettings);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Wait for images to load
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter(img => !img.complete)
            .map(img => new Promise(resolve => {
              img.onload = img.onerror = resolve;
            }))
        );
      });

      // Take screenshot
      const screenshot = await page.screenshot({
        type: exportSettings.format === 'jpg' ? 'jpeg' : 'png',
        quality: exportSettings.format === 'jpg' ? exportSettings.quality : undefined,
        omitBackground: false
      });

      return screenshot;
    } finally {
      await page.close();
    }
  }

  /**
   * Generate HTML for rendering screenshot
   * @param {Object} config - Screenshot configuration
   * @param {string} imageUrl - URL or path to original image
   * @param {Object} exportSettings - Export settings
   * @returns {string} - HTML string
   */
  generateHTML(config, imageUrl, exportSettings) {
    const {
      backgroundColor = '#f5f5f7',
      backgroundType = 'solid',
      gradientColors = ['#667eea', '#764ba2'],
      gradientAngle = 135,
      deviceFrame = 'iphone',
      devicePosition = { x: 50, y: 50 },
      textTop = '',
      textBottom = '',
      textColor = '#000000',
      fontSize = 32,
      fontFamily = 'Arial, sans-serif',
      fontWeight = 'bold',
      textShadow = false,
      textTopPosition = { x: 50, y: 15 },
      textBottomPosition = { x: 50, y: 85 },
      rotation = 0,
      brightness = 100,
      contrast = 100,
      saturation = 100,
      blur = 0,
      decorativeImages = []
    } = config;

    // Generate background style
    let backgroundStyle;
    if (backgroundType === 'gradient') {
      const gradientString = gradientColors.join(', ');
      backgroundStyle = `linear-gradient(${gradientAngle}deg, ${gradientString})`;
    } else {
      backgroundStyle = backgroundColor;
    }

    // Generate CSS filters
    const filters = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `blur(${blur}px)`
    ].join(' ');

    // Generate decorative images HTML
    const decorativeImagesHTML = decorativeImages.map(img => `
      <img
        src="${img.src}"
        style="
          position: absolute;
          left: ${img.x}%;
          top: ${img.y}%;
          width: ${img.width}px;
          height: ${img.height}px;
          transform: translate(-50%, -50%);
          z-index: ${img.zIndex || 2};
        "
        alt="decorative"
      />
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            width: ${exportSettings.width}px;
            height: ${exportSettings.height}px;
            background: ${backgroundStyle};
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            font-family: ${fontFamily};
          }

          .screenshot-container {
            position: absolute;
            left: ${devicePosition.x}%;
            top: ${devicePosition.y}%;
            transform: translate(-50%, -50%) rotate(${rotation}deg);
            max-width: 90%;
            max-height: 90%;
            z-index: 1;
          }

          .screenshot-image {
            max-width: 100%;
            max-height: 100%;
            filter: ${filters};
            ${deviceFrame !== 'none' ? 'border-radius: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);' : ''}
          }

          .text-overlay {
            position: absolute;
            color: ${textColor};
            font-size: ${fontSize}px;
            font-weight: ${fontWeight};
            font-family: ${fontFamily};
            ${textShadow ? 'text-shadow: 2px 2px 4px rgba(0,0,0,0.3);' : ''}
            white-space: pre-wrap;
            text-align: center;
            max-width: 90%;
            z-index: 3;
          }

          .text-top {
            left: ${textTopPosition.x}%;
            top: ${textTopPosition.y}%;
            transform: translate(-50%, -50%);
          }

          .text-bottom {
            left: ${textBottomPosition.x}%;
            top: ${textBottomPosition.y}%;
            transform: translate(-50%, -50%);
          }
        </style>
      </head>
      <body>
        ${textTop ? `<div class="text-overlay text-top">${textTop}</div>` : ''}

        <div class="screenshot-container">
          <img src="${imageUrl}" alt="screenshot" class="screenshot-image" />
        </div>

        ${decorativeImagesHTML}

        ${textBottom ? `<div class="text-overlay text-bottom">${textBottom}</div>` : ''}
      </body>
      </html>
    `;
  }

  /**
   * Optimize image using Sharp
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Object} options - Optimization options
   * @returns {Promise<Buffer>} - Optimized image buffer
   */
  async optimizeImage(imageBuffer, options = {}) {
    const {
      format = 'png',
      quality = 90,
      width,
      height,
      fit = 'inside'
    } = options;

    let sharpInstance = sharp(imageBuffer);

    // Resize if dimensions specified
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, { fit });
    }

    // Convert to specified format
    if (format === 'jpg' || format === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality });
    } else if (format === 'png') {
      sharpInstance = sharpInstance.png({ quality });
    } else if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality });
    }

    return await sharpInstance.toBuffer();
  }

  /**
   * Generate thumbnail from image
   * @param {Buffer} imageBuffer - Image buffer
   * @param {number} width - Thumbnail width
   * @param {number} height - Thumbnail height
   * @returns {Promise<Buffer>} - Thumbnail buffer
   */
  async generateThumbnail(imageBuffer, width = 300, height = 300) {
    return await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  /**
   * Apply filters to image
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Object} filters - Filter settings
   * @returns {Promise<Buffer>} - Filtered image buffer
   */
  async applyFilters(imageBuffer, filters) {
    const {
      brightness = 1,
      contrast = 1,
      saturation = 1,
      blur = 0,
      sharpen = false,
      grayscale = false
    } = filters;

    let sharpInstance = sharp(imageBuffer);

    // Apply modulate for brightness, saturation
    if (brightness !== 1 || saturation !== 1) {
      sharpInstance = sharpInstance.modulate({
        brightness: brightness,
        saturation: saturation
      });
    }

    // Apply linear for contrast
    if (contrast !== 1) {
      const alpha = contrast;
      const beta = 128 * (1 - contrast);
      sharpInstance = sharpInstance.linear(alpha, beta);
    }

    // Apply blur
    if (blur > 0) {
      sharpInstance = sharpInstance.blur(blur);
    }

    // Apply sharpen
    if (sharpen) {
      sharpInstance = sharpInstance.sharpen();
    }

    // Apply grayscale
    if (grayscale) {
      sharpInstance = sharpInstance.grayscale();
    }

    return await sharpInstance.toBuffer();
  }

  /**
   * Get image metadata
   * @param {Buffer} imageBuffer - Image buffer
   * @returns {Promise<Object>} - Image metadata
   */
  async getImageMetadata(imageBuffer) {
    return await sharp(imageBuffer).metadata();
  }

  /**
   * Batch process multiple screenshots
   * @param {Array} screenshots - Array of {config, imageUrl, exportSettings}
   * @param {Function} progressCallback - Progress callback function
   * @returns {Promise<Array<Buffer>>} - Array of rendered image buffers
   */
  async batchProcess(screenshots, progressCallback) {
    const results = [];
    const total = screenshots.length;

    for (let i = 0; i < screenshots.length; i++) {
      const { config, imageUrl, exportSettings } = screenshots[i];

      try {
        const result = await this.renderScreenshot(config, imageUrl, exportSettings);
        results.push({ success: true, data: result, index: i });
      } catch (error) {
        results.push({ success: false, error: error.message, index: i });
      }

      // Report progress
      if (progressCallback) {
        progressCallback(Math.round(((i + 1) / total) * 100));
      }
    }

    return results;
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles() {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = join(this.tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          console.log(`🗑️  Cleaned up old temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}

// Singleton instance
const imageProcessingService = new ImageProcessingService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await imageProcessingService.close();
});

export default imageProcessingService;
