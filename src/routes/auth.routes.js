import { Router } from "express";
import { check } from "express-validator";
import {
  register,
  login,
  logout,
  updateProfile,
  refreshAccessToken
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRefreshToken } from "../middlewares/auth.js"; // Middleware para refresh tokens
import {
  loginRateLimiter,
  registerRateLimiter
} from "../middlewares/rateLimit.js";
import { handleValidationErrors } from "../middlewares/validation.js";

const router = Router();

const validateRegister = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
];

const validateLogin = [
  check("email").isEmail().withMessage("Invalid email format"),
  check("password").notEmpty().withMessage("Password is required")
];

const validateProfileUpdate = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty"),
  check("email").optional().isEmail().withMessage("Invalid email format"),
  check("phone")
    .optional()
    .matches(/^\+\d{1,3}\s?\d{4,14}$/)
    .withMessage("Invalid phone number format")
];

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

export default router;
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the user
 *         email:
 *           type: string
 *           description: Email of the user
 *         password:
 *           type: string
 *           description: Password for the user account
 *         phone:
 *           type: string
 *           description: Phone number of the user
 *     AuthTokens:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Access token for the authenticated user
 *         refreshToken:
 *           type: string
 *           description: Refresh token for obtaining a new access token
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization operations
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or already existing user
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized, invalid token
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh the access token using the refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to get a new access token
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Invalid or expired refresh token
 */

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile (name, email, phone)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, invalid token
 *       404:
 *         description: User not found
 */
