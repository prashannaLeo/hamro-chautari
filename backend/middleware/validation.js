const validator = require('validator');
const rateLimit = require('express-rate-limit');

// Input sanitization and validation middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    // Remove potential script tags and normalize
    return validator.escape(str.trim()).substring(0, 10000); // Limit length
  };

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
    }
    return obj;
  };

  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query params
  if (req.query) {
    req.body = sanitizeObject(req.query);
  }

  next();
};

// Validate post creation
const validatePost = (req, res, next) => {
  const { content, visibility, postType } = req.body;

  const errors = [];

  if (!content || content.length < 1) {
    errors.push('Content is required');
  }

  if (content && content.length > 5000) {
    errors.push('Content must be less than 5000 characters');
  }

  if (visibility && !['public', 'friends', 'private'].includes(visibility)) {
    errors.push('Invalid visibility option');
  }

  if (postType && !['text', 'image', 'video', 'poll'].includes(postType)) {
    errors.push('Invalid post type');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Validate message creation
const validateMessage = (req, res, next) => {
  const { content, messageType } = req.body;

  const errors = [];

  if (!content || content.length < 1) {
    errors.push('Message content is required');
  }

  if (content && content.length > 2000) {
    errors.push('Message must be less than 2000 characters');
  }

  if (messageType && !['text', 'image', 'video', 'audio', 'file'].includes(messageType)) {
    errors.push('Invalid message type');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Validate user ID parameters
const validateUserId = (req, res, next) => {
  const userId = req.params.userId || req.body.userId;
  
  if (userId && !validator.isUUID(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  next();
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (!validator.isInt(page, { min: 1, max: 1000 }))) {
    return res.status(400).json({ error: 'Invalid page number' });
  }

  if (limit && (!validator.isInt(limit, { min: 1, max: 100 }))) {
    return res.status(400).json({ error: 'Invalid limit. Must be between 1-100' });
  }

  // Set defaults
  req.query.page = parseInt(page) || 1;
  req.query.limit = Math.min(parseInt(limit) || 10, 100); // Cap at 100

  next();
};

// Enhanced rate limiting for sensitive operations
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Reduced from 100 to 30
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const messageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: { error: 'Too many messages. Please slow down.' },
  keyGenerator: (req) => req.body.userId || req.ip, // Rate limit per user
});

const friendRequestRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 friend requests per hour
  message: { error: 'Too many friend requests. Please try again later.' },
  keyGenerator: (req) => req.body.userId || req.ip,
});

const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 searches per minute
  message: { error: 'Too many search requests. Please slow down.' },
});

module.exports = {
  sanitizeInput,
  validatePost,
  validateMessage,
  validateUserId,
  validatePagination,
  strictRateLimit,
  messageRateLimit,
  friendRequestRateLimit,
  searchRateLimit
};