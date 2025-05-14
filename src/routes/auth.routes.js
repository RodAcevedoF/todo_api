import { Router } from "express";
import {
  register,
  login,
  logout,
  updateProfile,
  refreshAccessToken,
  getProfile,
  deleteUser,
  updateSensitiveDataController,
  uploadProfileImage
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRefreshToken } from "../middlewares/auth.js"; // Middleware para refresh tokens
import {
  loginRateLimiter,
  registerRateLimiter
} from "../middlewares/rateLimit.js";
import { handleValidationErrors } from "../middlewares/validation.js";
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateSensitiveUpdate
} from "../middlewares/authValidators.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.post(
  "/register",
  registerRateLimiter,
  validateRegister,
  handleValidationErrors,
  register
);

router.post(
  "/login",
  loginRateLimiter,
  validateLogin,
  handleValidationErrors,
  login
);

router.post("/logout", authenticate, logout);

// Ruta para renovar el access token usando el refresh token
router.post("/refresh", validateRefreshToken, refreshAccessToken);

router.put(
  "/profile",
  authenticate,
  validateProfileUpdate,
  handleValidationErrors,
  updateProfile
);

// Nueva ruta para obtener el perfil del usuario autenticado
router.get("/profile", authenticate, getProfile);

// Nueva ruta para eliminar la cuenta de usuario
router.delete("/deleteUser", authenticate, deleteUser);

router.put(
  "/credentials",
  authenticate,
  validateSensitiveUpdate,
  handleValidationErrors,
  updateSensitiveDataController
);

router.post(
  "/profile-image",
  authenticate,
  uploadMiddleware,
  uploadProfileImage
);

export default router;
