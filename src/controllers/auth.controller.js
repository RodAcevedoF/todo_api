import { validationResult } from "express-validator";
import User from "../models/User.js";
import db from "../config/db.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";

/**
 * Registro de usuario:
 *  - Normaliza el correo y verifica si ya existe.
 *  - Crea el usuario.
 *  - Genera access y refresh tokens.
 *  - Inserta el refresh token en la base de datos.
 */
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return errorResponse(
        res,
        "The email is already registered. Please use another one.",
        400
      );
    }

    const user = await User.create({ name, email: normalizedEmail, password });

    // Generar access token usando el método del modelo o bien jwt.sign
    const accessToken = User.generateToken(user); // Se asume que genera un token válido (p.ej. expiración 15m)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || "7d" }
    );

    // Eliminar tokens anteriores para este usuario (opcional, si se busca tener sólo uno)
    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id]);

    // Guardar el refresh token en la base de datos
    await db.query(
      "INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)",
      [refreshToken, user.id]
    );
    await User.updateLastLogin(user.id);

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          nickname: user.nickname
        },
        accessToken,
        refreshToken
      },
      201
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return errorResponse(res, "Something went wrong during registration.", 500);
  }
};

/**
 * Login de usuario:
 *  - Valida credenciales.
 *  - Genera access y refresh tokens.
 *  - Elimina tokens anteriores para el usuario y almacena el refresh token.
 */
export const login = async (req, res) => {
  console.log("Login request received:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation errors:", errors.array());
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const { email, password } = req.body;
    const sanitizedEmail = email.trim().toLowerCase();
    const user = await User.findByEmail(sanitizedEmail);
    console.log("User found:", user);

    if (!user || !(await User.comparePassword(password, user.password))) {
      console.error("Invalid email or password.");
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const accessToken = User.generateToken(user);
    console.log("Access token generated");

    // Eliminar refresh tokens anteriores para este usuario
    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id]);

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || "7d" }
    );
    console.log("Refresh token generated");

    // Guardar el nuevo refresh token en la base de datos
    await db.query(
      "INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)",
      [refreshToken, user.id]
    );
    console.log("Refresh token saved to database.");

    await User.updateLastLogin(user.id);

    return successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname // 👈 Aquí lo agregas
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Error during login:", error);
    return errorResponse(res, "Failed to log in. Please try again.", 500);
  }
};

/**
 * Logout:
 *  - Recibe tanto el access token como el refresh token.
 *  - Invalida el access token (ej. insertándolo en una tabla de tokens negros).
 *  - Elimina el refresh token de la base de datos.
 */
export const logout = async (req, res) => {
  try {
    // Se espera que el access token esté en el header Authorization y el refresh token en el cuerpo
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const { refreshToken } = req.body;

    if (!token || !refreshToken) {
      return errorResponse(res, "Access token or refresh token missing.", 400);
    }

    // Verificar si el token ya está invalidado (opcional)
    const existingToken = await db.query(
      "SELECT token FROM blacklisted_tokens WHERE token = $1",
      [token]
    );

    if (existingToken.rows.length > 0) {
      return errorResponse(res, "Token is already invalidated.", 400);
    }

    // Invalida el access token registrándolo en la tabla de tokens negros
    await db.query("INSERT INTO blacklisted_tokens (token) VALUES ($1)", [
      token
    ]);

    // Elimina el refresh token asociado
    await db.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken
    ]);

    return successResponse(res, "Logged out successfully.");
  } catch (error) {
    console.error("Error during logout:", error);
    return errorResponse(res, "Failed to log out.", 500);
  }
};

/**
 * Actualización de perfil:
 *  - Permite modificar campos permitidos.
 */
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      "name",
      "email",
      "description",
      "profile_image",
      "phone",
      "website",
      "github_url",
      "birth_date",
      "hobbies",
      "location",
      "nickname",
      "profile_image_public_id"
    ];

    const validUpdates = Object.keys(updates).filter((key) =>
      allowedUpdates.includes(key)
    );

    if (validUpdates.length === 0) {
      return errorResponse(res, "No valid fields provided for update.", 400);
    }

    if (updates.email && !/\S+@\S+\.\S+/.test(updates.email)) {
      return errorResponse(res, "Invalid email format.", 400);
    }

    for (const key in updates) {
      if (updates[key] === "") {
        updates[key] = null;
      }
    }

    const updatedUser = await User.update(req.user.id, updates);

    return successResponse(res, {
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return errorResponse(res, "Failed to update profile.", 500);
  }
};

/**
 * Renovación del accessToken:
 *  - Verifica que el refresh token esté presente y exista en la base de datos.
 *  - Decodifica el refresh token y genera un nuevo access token.
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, error: "Refresh token is missing" });
    }

    // Verificar que el refresh token exista en la base de datos
    const { rows } = await db.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [refreshToken]
    );
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid refresh token" });
    }

    // Decodificar el refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generar un nuevo access token (ejemplo: expiración de 15 minutos)
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: "15m"
    });

    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    console.error("Error during token refresh:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to refresh access token" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Eliminar el usuario
    const result = await User.deleteUser(userId);

    if (!result) {
      return errorResponse(res, "Failed to delete user.", 500);
    }

    return successResponse(res, "User deleted successfully.", 200);
  } catch (error) {
    console.error("Error during user deletion:", error);
    return errorResponse(res, "Failed to delete user.", 500);
  }
};

/**
 * Obtener información del perfil:
 *  - Devuelve los datos del usuario autenticado.
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }

    return successResponse(res, { user }, 200);
  } catch (error) {
    console.error("Error getting profile:", error);
    return errorResponse(res, "Failed to get profile.", 500);
  }
};

export const updateSensitiveDataController = async (req, res) => {
  // 1) Validaciones de express-validator ya pasaron
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const { email, password, currentPassword } = req.body;

    // 2) Verificar campos mínimos
    if (!email && !password) {
      return errorResponse(res, "No fields to update.", 400);
    }
    if (!currentPassword) {
      return errorResponse(res, "Current password is required.", 400);
    }

    // 3) Validar formato de email
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return errorResponse(res, "Invalid email format.", 400);
    }

    // 4) Llamar al modelo para actualizar datos sensibles
    const updatedUser = await User.updateSensitiveData(
      req.user.id,
      currentPassword,
      { newEmail: email, newPassword: password }
    );

    // 5) Responder con el usuario actualizado (sin password)
    return successResponse(res, {
      message: "Credentials updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating sensitive data:", error);
    // Enviar mensaje de error claro (puedes detectar el error.message específico)
    return errorResponse(
      res,
      error.message === "Incorrect current password"
        ? "Current password is incorrect."
        : "Failed to update credentials.",
      error.message === "Incorrect current password" ? 401 : 500
    );
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    // Verificamos que el middleware haya asignado ambos datos.
    if (!req.fileUrl || !req.filePublicId) {
      return res
        .status(400)
        .json({ success: false, error: "No image uploaded" });
    }

    const userId = req.user.id;

    // Obtenemos el usuario y, si ya tiene una imagen, eliminamos la anterior en Cloudinary.
    const existingUser = await User.findById(userId);
    if (existingUser && existingUser.profile_image_public_id) {
      await cloudinary.uploader.destroy(existingUser.profile_image_public_id);
    }

    // Actualizamos la imagen de perfil del usuario en la DB utilizando el método del modelo.
    const updatedUser = await User.updateProfileImage(userId, {
      url: req.fileUrl,
      publicId: req.filePublicId
    });

    return successResponse(res, {
      message: "Profile image updated",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
