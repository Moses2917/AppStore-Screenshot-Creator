import Queue from 'bull';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

// Create Redis client for Bull
const createRedisClient = (type) => {
  const client = new Redis(redisConfig);

  client.on('error', (error) => {
    console.error(`Redis ${type} error:`, error);
  });

  client.on('connect', () => {
    console.log(`✅ Redis ${type} connected`);
  });

  return client;
};

// Export queue for processing export jobs
const exportQueue = new Queue('export-processing', {
  createClient: (type) => createRedisClient(type),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: false,
    removeOnFail: false
  }
});

// Image processing queue for optimization and thumbnail generation
const imageQueue = new Queue('image-processing', {
  createClient: (type) => createRedisClient(type),
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Cleanup queue for removing old files and expired data
const cleanupQueue = new Queue('cleanup', {
  createClient: (type) => createRedisClient(type),
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: true
  }
});

// Queue event listeners
exportQueue.on('completed', (job, result) => {
  console.log(`✅ Export job ${job.id} completed`);
});

exportQueue.on('failed', (job, err) => {
  console.error(`❌ Export job ${job.id} failed:`, err.message);
});

exportQueue.on('progress', (job, progress) => {
  console.log(`📊 Export job ${job.id} progress: ${progress}%`);
});

imageQueue.on('completed', (job) => {
  console.log(`✅ Image processing job ${job.id} completed`);
});

imageQueue.on('failed', (job, err) => {
  console.error(`❌ Image processing job ${job.id} failed:`, err.message);
});

cleanupQueue.on('completed', (job) => {
  console.log(`✅ Cleanup job ${job.id} completed`);
});

/**
 * Add export job to queue
 * @param {Object} jobData - Job data
 * @returns {Promise<Job>} - Bull job instance
 */
export const addExportJob = async (jobData) => {
  const {
    exportJobId,
    userId,
    projectId,
    screenshots,
    exportSettings,
    exportType,
    priority = 'normal'
  } = jobData;

  const priorityMap = {
    low: 10,
    normal: 5,
    high: 1
  };

  return await exportQueue.add(
    {
      exportJobId,
      userId,
      projectId,
      screenshots,
      exportSettings,
      exportType
    },
    {
      priority: priorityMap[priority] || 5,
      jobId: exportJobId,
      timeout: 300000 // 5 minutes timeout
    }
  );
};

/**
 * Add image processing job to queue
 * @param {Object} jobData - Job data
 * @returns {Promise<Job>} - Bull job instance
 */
export const addImageProcessingJob = async (jobData) => {
  const {
    screenshotId,
    userId,
    imageBuffer,
    operations
  } = jobData;

  return await imageQueue.add({
    screenshotId,
    userId,
    imageBuffer,
    operations
  });
};

/**
 * Add cleanup job to queue
 * @param {Object} jobData - Job data
 * @returns {Promise<Job>} - Bull job instance
 */
export const addCleanupJob = async (jobData) => {
  return await cleanupQueue.add(jobData, {
    delay: jobData.delay || 0
  });
};

/**
 * Get job status by ID
 * @param {string} jobId - Job ID
 * @param {string} queueType - Queue type (export, image, cleanup)
 * @returns {Promise<Object>} - Job status
 */
export const getJobStatus = async (jobId, queueType = 'export') => {
  const queue = queueType === 'export' ? exportQueue :
                queueType === 'image' ? imageQueue :
                cleanupQueue;

  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress();
  const failedReason = job.failedReason;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    failedReason,
    attemptsMade: job.attemptsMade,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn
  };
};

/**
 * Cancel job by ID
 * @param {string} jobId - Job ID
 * @param {string} queueType - Queue type
 * @returns {Promise<void>}
 */
export const cancelJob = async (jobId, queueType = 'export') => {
  const queue = queueType === 'export' ? exportQueue :
                queueType === 'image' ? imageQueue :
                cleanupQueue;

  const job = await queue.getJob(jobId);

  if (job) {
    await job.remove();
  }
};

/**
 * Get queue statistics
 * @param {string} queueType - Queue type
 * @returns {Promise<Object>} - Queue stats
 */
export const getQueueStats = async (queueType = 'export') => {
  const queue = queueType === 'export' ? exportQueue :
                queueType === 'image' ? imageQueue :
                cleanupQueue;

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
};

/**
 * Pause queue
 * @param {string} queueType - Queue type
 * @returns {Promise<void>}
 */
export const pauseQueue = async (queueType = 'export') => {
  const queue = queueType === 'export' ? exportQueue :
                queueType === 'image' ? imageQueue :
                cleanupQueue;

  await queue.pause();
};

/**
 * Resume queue
 * @param {string} queueType - Queue type
 * @returns {Promise<void>}
 */
export const resumeQueue = async (queueType = 'export') => {
  const queue = queueType === 'export' ? exportQueue :
                queueType === 'image' ? imageQueue :
                cleanupQueue;

  await queue.resume();
};

/**
 * Clean old jobs from queue
 * @param {string} queueType - Queue type
 * @param {number} grace - Grace period in milliseconds
 * @returns {Promise<void>}
 */
export const cleanOldJobs = async (queueType = 'export', grace = 24 * 60 * 60 * 1000) => {
  const queue = queueType === 'export' ? exportQueue :
                queueType === 'image' ? imageQueue :
                cleanupQueue;

  await queue.clean(grace, 'completed');
  await queue.clean(grace, 'failed');
};

/**
 * Get all active jobs
 * @param {string} queueType - Queue type
 * @returns {Promise<Array>} - Array of active jobs
 */
export const getActiveJobs = async (queueType = 'export') => {
  const queue = queueType === 'export' ? exportQueue :
                queueType === 'image' ? imageQueue :
                cleanupQueue;

  return await queue.getActive();
};

/**
 * Retry failed job
 * @param {string} jobId - Job ID
 * @param {string} queueType - Queue type
 * @returns {Promise<void>}
 */
export const retryJob = async (jobId, queueType = 'export') => {
  const queue = queueType === 'export' ? exportQueue :
                queueType === 'image' ? imageQueue :
                cleanupQueue;

  const job = await queue.getJob(jobId);

  if (job) {
    await job.retry();
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 Shutting down queues...');
  await exportQueue.close();
  await imageQueue.close();
  await cleanupQueue.close();
  console.log('✅ Queues closed');
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export {
  exportQueue,
  imageQueue,
  cleanupQueue
};
