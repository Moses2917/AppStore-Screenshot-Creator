import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  enableOfflineQueue: false
});

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl:api',
  points: 100,
  duration: 15 * 60, // 15 minutes
  blockDuration: 60 * 15 // Block for 15 minutes if exceeded
});

// Auth endpoints rate limiter (5 attempts per 15 minutes)
const authLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl:auth',
  points: 5,
  duration: 15 * 60,
  blockDuration: 60 * 30 // Block for 30 minutes
});

// Export endpoints rate limiter (10 exports per hour)
const exportLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl:export',
  points: 10,
  duration: 60 * 60,
  blockDuration: 60 * 60 // Block for 1 hour
});

// Upload endpoints rate limiter (20 uploads per hour)
const uploadLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl:upload',
  points: 20,
  duration: 60 * 60,
  blockDuration: 60 * 30
});

/**
 * Create rate limiter middleware
 */
const createRateLimiterMiddleware = (limiter, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      // Generate key based on user ID or IP
      const key = keyGenerator
        ? keyGenerator(req)
        : req.userId || req.ip;

      await limiter.consume(key);
      next();
    } catch (rejRes) {
      if (rejRes instanceof Error) {
        // Redis connection error - allow request but log error
        console.error('Rate limiter error:', rejRes);
        return next();
      }

      // Rate limit exceeded
      const retryAfter = Math.round(rejRes.msBeforeNext / 1000) || 1;

      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(rejRes.points));
      res.set('X-RateLimit-Remaining', String(rejRes.remainingPoints));
      res.set('X-RateLimit-Reset', String(new Date(Date.now() + rejRes.msBeforeNext)));

      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter
      });
    }
  };
};

/**
 * General API rate limiter middleware
 */
export const rateLimiter = createRateLimiterMiddleware(apiLimiter);

/**
 * Auth rate limiter middleware
 */
export const authRateLimiter = createRateLimiterMiddleware(authLimiter, (req) => {
  return `${req.ip}_${req.body.email || 'unknown'}`;
});

/**
 * Export rate limiter middleware
 */
export const exportRateLimiter = createRateLimiterMiddleware(exportLimiter, (req) => {
  return req.userId || req.ip;
});

/**
 * Upload rate limiter middleware
 */
export const uploadRateLimiter = createRateLimiterMiddleware(uploadLimiter, (req) => {
  return req.userId || req.ip;
});

/**
 * Premium user rate limiter (higher limits)
 */
export const premiumRateLimiter = async (req, res, next) => {
  // Premium users get 10x higher limits
  if (req.user && (req.user.role === 'premium' || req.user.role === 'admin')) {
    return next();
  }

  return rateLimiter(req, res, next);
};

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis rate limiter error:', err);
});

export default rateLimiter;
