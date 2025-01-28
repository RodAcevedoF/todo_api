import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 intentos por ventana de tiempo
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

export const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Límite de 10 registros por ventana de tiempo
  message: {
    success: false,
    error: 'Too many registration attempts. Please try again after 15 minutes.'
  }
});
