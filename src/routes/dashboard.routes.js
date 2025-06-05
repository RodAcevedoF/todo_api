import { Router } from "express";
import { getDashboardInfo } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { requireVerifiedUser } from "../middlewares/requireVerifiedUser.js";

const router = Router();

router.get("/", authenticate, requireVerifiedUser, getDashboardInfo);

export default router;
