import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  limit: 10,
  windowMs: 1000 * 60 * 2,
});
