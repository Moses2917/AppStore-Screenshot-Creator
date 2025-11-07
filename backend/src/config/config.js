import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server
  server: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'screenshot_creator',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'screenshot-creator-storage',
    cloudFrontUrl: process.env.CLOUDFRONT_URL || null
  },

  // Local Storage
  storage: {
    localPath: process.env.LOCAL_STORAGE_PATH || './storage',
    useLocal: !process.env.AWS_ACCESS_KEY_ID
  },

  // Rate Limiting
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
    maxFiles: parseInt(process.env.MAX_FILES_PER_UPLOAD) || 10,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  },

  // Export
  export: {
    expirationDays: parseInt(process.env.EXPORT_EXPIRATION_DAYS) || 7,
    tempFileCleanupHours: parseInt(process.env.TEMP_FILE_CLEANUP_HOURS) || 24,
    defaultFormat: 'png',
    defaultQuality: 90,
    defaultScale: 2
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'noreply@screenshot-creator.com'
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Feature Flags
  features: {
    premium: process.env.ENABLE_PREMIUM_FEATURES === 'true',
    ai: process.env.ENABLE_AI_FEATURES === 'true',
    batchProcessing: process.env.ENABLE_BATCH_PROCESSING !== 'false'
  },

  // Storage Quotas
  quotas: {
    free: 5 * 1024 * 1024 * 1024, // 5GB
    premium: 100 * 1024 * 1024 * 1024, // 100GB
    admin: -1 // Unlimited
  }
};

export default config;
