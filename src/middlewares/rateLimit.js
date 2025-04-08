import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 12, // Máximo 12 intentos
  standardHeaders: true, // Información en los headers estándar
  legacyHeaders: false, // Deshabilita headers heredados
  trustProxy: false, // Evitar que proxies no confiables bypass el sistema
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
