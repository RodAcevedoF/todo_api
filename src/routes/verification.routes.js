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

const router = Router();

// Email verification
router.post("/verify/request", authenticate, requestEmailVerification);
router.get("/verify", verifyEmail);

// Password reset
router.post("/password/reset/request", requestPasswordReset);
router.post("/password/reset", resetPassword);

export default router;
