import { Router } from "express";
import {
  requestEmailVerification,
  verifyEmail
} from "../controllers/emailVerification.controller.js";

import {
  requestPasswordReset,
  resetPassword
} from "../controllers/passwordReset.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { requireUnverifiedUser } from "../middlewares/requireUnverifiedUser.js";

const router = Router();

// Email verification
router.get("/verify", verifyEmail);
router.post(
  "/verify/request",
  authenticate,
  requireUnverifiedUser,
  requestEmailVerification
);
// Password reset
router.post("/password/reset/request", requestPasswordReset);
router.post("/password/reset", resetPassword);

export default router;
