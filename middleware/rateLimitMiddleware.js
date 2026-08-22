const rateLimit = require('express-rate-limit');

// General limiter for most API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requests per IP per window
  message: { message: 'Too many requests, please try again later' },
});

// Stricter limiter specifically for login/register — the most sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 login/register attempts per IP per 15 minutes
  message: { message: 'Too many attempts, please try again later' },
});

module.exports = { generalLimiter, authLimiter };