/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints for user authentication and profile management
 *
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or email already registered
 *
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: Token missing or invalid
 *
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Fields to update (e.g., name, description, profile_image, phone)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               profile_image:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 */

import { Router } from "express";
import { check } from "express-validator";
import { register, login, logout, updateProfile } from "../controllers/auth.controller.js";
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

router.put("/profile", authenticate, updateProfile);

export default router;
