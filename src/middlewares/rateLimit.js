import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 12,
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 5 minutes."
  }
});

export const registerRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 12,
  message: {
    success: false,
    error: "Too many registration attempts. Please try again after 5 minutes."
  }
});
