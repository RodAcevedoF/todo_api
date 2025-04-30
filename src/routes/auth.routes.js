import { Router } from "express";
import { check } from "express-validator";
import {
  register,
  login,
  logout,
  updateProfile,
  refreshAccessToken,
  getProfile,
  deleteUser
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
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
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

// Nueva ruta para obtener el perfil del usuario autenticado
router.get("/profile", authenticate, getProfile);

// Nueva ruta para eliminar la cuenta de usuario
router.delete("/deleteUser", authenticate, deleteUser);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the user
 *         email:
 *           type: string
 *           description: Email address of the user
 *         password:
 *           type: string
 *           description: Password of the user
 *         phone:
 *           type: string
 *           description: Phone number of the user (optional)
 *         accessToken:
 *           type: string
 *           description: Access token for the authenticated user
 *         refreshToken:
 *           type: string
 *           description: Refresh token for the authenticated user
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and profile management
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or email already in use
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *               password:
 *                 type: string
 *                 description: Password of the user
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout the user and invalidate the tokens
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh access token using a refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to get a new access token
 *     responses:
 *       200:
 *         description: Successfully refreshed access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New access token
 *       400:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched the user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *               phone:
 *                 type: string
 *                 description: Phone number of the user (optional)
 *     responses:
 *       200:
 *         description: Successfully updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /deleteUser:
 *   delete:
 *     summary: Delete the user's account
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted the user account
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
