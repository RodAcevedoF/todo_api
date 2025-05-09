import { Router } from "express";
import { getDashboardInfo } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, getDashboardInfo);

export default router;
