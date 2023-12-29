import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  limit: 25,
  windowMs: 1000 * 60 * 2,
});
