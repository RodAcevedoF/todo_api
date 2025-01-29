/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *       required:
 *         - name
 *         - email
 *         - password
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */

import { Router } from "express";
import { check } from "express-validator";
import { register, login, logout } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import {
  loginRateLimiter,
  registerRateLimiter
} from "../middlewares/rateLimit.js";

const router = Router();

router.post(
  "/register",
  registerRateLimiter,
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("email").isEmail().withMessage("Invalid email format"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
  ],
  register
);

router.post(
  "/login",
  loginRateLimiter,
  [
    check("email").isEmail().withMessage("Invalid email format"),
    check("password").notEmpty().withMessage("Password is required")
  ],
  login
);

router.post("/logout", authenticate, logout);

export default router;
