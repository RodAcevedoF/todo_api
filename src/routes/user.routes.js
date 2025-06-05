import { Router } from "express";
import {
  register,
  updateProfile,
  deleteUser,
  getProfile,
  updateSensitiveData,
  uploadProfileImage
} from "../controllers/user.controller.js";
import {
  validateRegister,
  validateProfileUpdate,
  validateSensitiveUpdate
} from "../middlewares/authValidators.js";
import { handleValidationErrors } from "../middlewares/validation.js";
import { registerRateLimiter } from "../middlewares/rateLimit.js";
import { authenticate } from "../middlewares/auth.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";
import { requireVerifiedUser } from "../middlewares/requireVerifiedUser.js";

const router = Router();

router.post(
  "/register",
  registerRateLimiter,
  validateRegister,
  handleValidationErrors,
  register
);

router.get("/profile", authenticate, requireVerifiedUser, getProfile);

router.put(
  "/profile",
  authenticate,
  requireVerifiedUser,
  validateProfileUpdate,
  handleValidationErrors,
  updateProfile
);

router.put(
  "/credentials",
  authenticate,
  requireVerifiedUser,
  validateSensitiveUpdate,
  handleValidationErrors,
  updateSensitiveData
);

router.post(
  "/profile-image",
  authenticate,
  requireVerifiedUser,
  uploadMiddleware,
  uploadProfileImage
);

router.delete("/delete", authenticate, requireVerifiedUser, deleteUser);

export default router;
