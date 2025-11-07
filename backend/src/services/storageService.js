import AWS from 'aws-sdk';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

class StorageService {
  constructor() {
    // Configure AWS S3
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.bucket = process.env.AWS_S3_BUCKET || 'screenshot-creator-storage';
    this.cloudFrontUrl = process.env.CLOUDFRONT_URL || null;

    // Fallback to local storage if AWS not configured
    this.useLocalStorage = !process.env.AWS_ACCESS_KEY_ID;
    this.localStoragePath = process.env.LOCAL_STORAGE_PATH || './storage';

    if (this.useLocalStorage) {
      console.log('⚠️  Using local storage (AWS not configured)');
      this.initializeLocalStorage();
    } else {
      console.log('✅ AWS S3 storage initialized');
    }
  }

  /**
   * Initialize local storage directories
   */
  async initializeLocalStorage() {
    try {
      await fs.mkdir(this.localStoragePath, { recursive: true });
      await fs.mkdir(path.join(this.localStoragePath, 'uploads'), { recursive: true });
      await fs.mkdir(path.join(this.localStoragePath, 'exports'), { recursive: true });
      await fs.mkdir(path.join(this.localStoragePath, 'thumbnails'), { recursive: true });
      await fs.mkdir(path.join(this.localStoragePath, 'processed'), { recursive: true });
    } catch (error) {
      console.error('Error initializing local storage:', error);
    }
  }

  /**
   * Upload file to storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filePath - Storage path
   * @param {Object} options - Upload options
   * @returns {Promise<string>} - File URL
   */
  async uploadFile(fileBuffer, filePath, options = {}) {
    if (this.useLocalStorage) {
      return await this.uploadFileLocal(fileBuffer, filePath, options);
    } else {
      return await this.uploadFileS3(fileBuffer, filePath, options);
    }
  }

  /**
   * Upload file to S3
   */
  async uploadFileS3(fileBuffer, filePath, options = {}) {
    const {
      contentType = 'application/octet-stream',
      cacheControl = 'public, max-age=31536000',
      acl = 'public-read'
    } = options;

    const params = {
      Bucket: this.bucket,
      Key: filePath,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: cacheControl,
      ACL: acl
    };

    try {
      const result = await this.s3.upload(params).promise();

      // Return CloudFront URL if configured, otherwise S3 URL
      if (this.cloudFrontUrl) {
        return `${this.cloudFrontUrl}/${filePath}`;
      }

      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload file to local storage
   */
  async uploadFileLocal(fileBuffer, filePath, options = {}) {
    const fullPath = path.join(this.localStoragePath, filePath);
    const directory = path.dirname(fullPath);

    try {
      // Ensure directory exists
      await fs.mkdir(directory, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, fileBuffer);

      // Return local URL
      return `/storage/${filePath}`;
    } catch (error) {
      console.error('Local upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download file from storage
   * @param {string} fileUrl - File URL
   * @returns {Promise<Buffer>} - File buffer
   */
  async downloadFile(fileUrl) {
    if (this.useLocalStorage) {
      return await this.downloadFileLocal(fileUrl);
    } else {
      return await this.downloadFileS3(fileUrl);
    }
  }

  /**
   * Download file from S3
   */
  async downloadFileS3(fileUrl) {
    try {
      // Extract key from URL
      let key;
      if (fileUrl.startsWith('http')) {
        const url = new URL(fileUrl);
        key = url.pathname.substring(1);
      } else {
        key = fileUrl;
      }

      const params = {
        Bucket: this.bucket,
        Key: key
      };

      const result = await this.s3.getObject(params).promise();
      return result.Body;
    } catch (error) {
      console.error('S3 download error:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Download file from local storage
   */
  async downloadFileLocal(fileUrl) {
    try {
      // Remove /storage/ prefix if present
      const filePath = fileUrl.startsWith('/storage/')
        ? fileUrl.substring(9)
        : fileUrl;

      const fullPath = path.join(this.localStoragePath, filePath);
      return await fs.readFile(fullPath);
    } catch (error) {
      console.error('Local download error:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete file from storage
   * @param {string} fileUrl - File URL
   * @returns {Promise<void>}
   */
  async deleteFile(fileUrl) {
    if (this.useLocalStorage) {
      return await this.deleteFileLocal(fileUrl);
    } else {
      return await this.deleteFileS3(fileUrl);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFileS3(fileUrl) {
    try {
      let key;
      if (fileUrl.startsWith('http')) {
        const url = new URL(fileUrl);
        key = url.pathname.substring(1);
      } else {
        key = fileUrl;
      }

      const params = {
        Bucket: this.bucket,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteFileLocal(fileUrl) {
    try {
      const filePath = fileUrl.startsWith('/storage/')
        ? fileUrl.substring(9)
        : fileUrl;

      const fullPath = path.join(this.localStoragePath, filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Local delete error:', error);
      // Don't throw error if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    }
  }

  /**
   * Delete multiple files
   * @param {Array<string>} fileUrls - Array of file URLs
   * @returns {Promise<void>}
   */
  async deleteFiles(fileUrls) {
    const deletePromises = fileUrls.map(url => this.deleteFile(url));
    await Promise.allSettled(deletePromises);
  }

  /**
   * Get file metadata
   * @param {string} fileUrl - File URL
   * @returns {Promise<Object>} - File metadata
   */
  async getFileMetadata(fileUrl) {
    if (this.useLocalStorage) {
      return await this.getFileMetadataLocal(fileUrl);
    } else {
      return await this.getFileMetadataS3(fileUrl);
    }
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadataS3(fileUrl) {
    try {
      let key;
      if (fileUrl.startsWith('http')) {
        const url = new URL(fileUrl);
        key = url.pathname.substring(1);
      } else {
        key = fileUrl;
      }

      const params = {
        Bucket: this.bucket,
        Key: key
      };

      const result = await this.s3.headObject(params).promise();

      return {
        size: result.ContentLength,
        contentType: result.ContentType,
        lastModified: result.LastModified,
        etag: result.ETag
      };
    } catch (error) {
      console.error('S3 metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Get file metadata from local storage
   */
  async getFileMetadataLocal(fileUrl) {
    try {
      const filePath = fileUrl.startsWith('/storage/')
        ? fileUrl.substring(9)
        : fileUrl;

      const fullPath = path.join(this.localStoragePath, filePath);
      const stats = await fs.stat(fullPath);

      return {
        size: stats.size,
        lastModified: stats.mtime,
        contentType: this.getContentType(fullPath)
      };
    } catch (error) {
      console.error('Local metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Generate signed URL for temporary access
   * @param {string} fileUrl - File URL
   * @param {number} expiresIn - Expiration time in seconds
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedUrl(fileUrl, expiresIn = 3600) {
    if (this.useLocalStorage) {
      // Local storage doesn't need signed URLs
      return fileUrl;
    }

    try {
      let key;
      if (fileUrl.startsWith('http')) {
        const url = new URL(fileUrl);
        key = url.pathname.substring(1);
      } else {
        key = fileUrl;
      }

      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn
      };

      return this.s3.getSignedUrl('getObject', params);
    } catch (error) {
      console.error('Signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Get content type from file extension
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.json': 'application/json'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Copy file within storage
   * @param {string} sourceUrl - Source file URL
   * @param {string} destPath - Destination path
   * @returns {Promise<string>} - New file URL
   */
  async copyFile(sourceUrl, destPath) {
    const fileBuffer = await this.downloadFile(sourceUrl);
    const metadata = await this.getFileMetadata(sourceUrl);

    return await this.uploadFile(fileBuffer, destPath, {
      contentType: metadata.contentType
    });
  }

  /**
   * Check if file exists
   * @param {string} fileUrl - File URL
   * @returns {Promise<boolean>} - True if file exists
   */
  async fileExists(fileUrl) {
    try {
      await this.getFileMetadata(fileUrl);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new StorageService();
