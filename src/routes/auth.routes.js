import { Router } from "express";
import {
  login,
  logout,
  refreshAccessToken
} from "../controllers/auth.controller.js";
import {
  loginRateLimiter,
  registerRateLimiter
} from "../middlewares/rateLimit.js";
import { validateLogin } from "../middlewares/authValidators.js";
import { handleValidationErrors } from "../middlewares/validation.js";
import { authenticate, validateRefreshToken } from "../middlewares/auth.js";

const router = Router();

router.post(
  "/login",
  loginRateLimiter,
  validateLogin,
  handleValidationErrors,
  login
);

router.post("/logout", authenticate, logout);

router.post("/refresh", validateRefreshToken, refreshAccessToken);

export default router;
