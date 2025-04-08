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
 * tags:
 *   name: Auth
 *   description: Gestión de autenticación de usuarios
 *
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
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
 *                 description: Nombre del usuario.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 description: Contraseña (mínimo 6 caracteres).
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: Error en la validación de datos.
 *
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
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
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *       401:
 *         description: Credenciales incorrectas.
 *
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cierre de sesión exitoso.
 *       401:
 *         description: No autorizado.
 *
 * /api/auth/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del usuario.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nuevo correo electrónico.
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente.
 *       400:
 *         description: Error en la validación de datos.
 *       401:
 *         description: No autorizado.
 */
