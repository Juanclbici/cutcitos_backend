import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 logins for IP
  message: {
    message: 'Too many login attempts. Please try again in 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

