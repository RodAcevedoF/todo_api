import { validationResult } from "express-validator";
import User from "../models/User.js";
import db from "../config/db.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

/* export const register = async (req, res) => {
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
      return errorResponse(res, "Email already registered", 400);
    }

    const user = await User.create({ name, email: normalizedEmail, password });
    const token = User.generateToken({ id: user.id });

    successResponse(
      res,
      { user: { id: user.id, name: user.name, email: user.email }, token },
      201
    );
  } catch (error) {
    errorResponse(res, error.message);
  }
};
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

    const existingUser = await User.findByEmail(normalizedEmail); // Corregido aquí
    if (existingUser) {
      return errorResponse(
        res,
        "The email is already registered. Please use another one.",
        400
      );
    }

    const user = await User.create({ name, email: normalizedEmail, password });
    const token = User.generateToken({ id: user.id });

    return successResponse(
      res,
      { user: { id: user.id, name: user.name, email: user.email }, token },
      201
    );
  } catch (error) {
    console.error("Error during registration:", error); // Log para depuración
    return errorResponse(res, "Something went wrong during registration.", 500);
  }
};

/* export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findByEmail(normalizedEmail);

    if (!user || !(await User.comparePassword(password, user.password))) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const token = User.generateToken(user);
    successResponse(res, {
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    errorResponse(res, error.message);
  }
}; */
export const login = async (req, res) => {
  console.log("Login request received:", req.body); // Log inicial

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
    console.log("Sanitized email:", email);

    const sanitizedEmail = email.trim().toLowerCase();
    const user = await User.findByEmail(sanitizedEmail);
    console.log("User found:", user);

    if (!user || !(await User.comparePassword(password, user.password))) {
      console.error("Invalid email or password.");
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const accessToken = User.generateToken(user); // Token de acceso
    console.log("Access token generated:", accessToken);

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET, // Secreto del refresh token
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
    );
    console.log("Refresh token generated:", refreshToken);

    // Guardar el refresh token en la base de datos
    await db.query(
      "INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)",
      [refreshToken, user.id]
    );
    console.log("Refresh token saved to database.");

    return successResponse(res, {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Error during login:", error);
    return errorResponse(res, "Failed to log in. Please try again.", 500);
  }
};

/* 
export const logout = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return errorResponse(res, "No token provided.", 400);
    }

    const existingToken = await db.query(
      "SELECT token FROM blacklisted_tokens WHERE token = $1",
      [token]
    );

    if (existingToken.rows.length > 0) {
      return errorResponse(res, "Token is already invalidated.", 400);
    }

    await db.query("INSERT INTO blacklisted_tokens (token) VALUES ($1)", [
      token
    ]);

    return successResponse(res, "Logged out successfully.");
  } catch (error) {
    console.error("Error during logout:", error);
    return errorResponse(res, "Failed to log out.", 500);
  }
};
 */

export const logout = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const { refreshToken } = req.body; // Recibe el refresh token del cliente

    if (!token || !refreshToken) {
      return errorResponse(res, "Access token or refresh token missing.", 400);
    }

    const existingToken = await db.query(
      "SELECT token FROM blacklisted_tokens WHERE token = $1",
      [token]
    );

    if (existingToken.rows.length > 0) {
      return errorResponse(res, "Token is already invalidated.", 400);
    }

    // Invalida el access token
    await db.query("INSERT INTO blacklisted_tokens (token) VALUES ($1)", [
      token
    ]);

    // Elimina el refresh token del usuario
    await db.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken
    ]);

    return successResponse(res, "Logged out successfully.");
  } catch (error) {
    console.error("Error during logout:", error);
    return errorResponse(res, "Failed to log out.", 500);
  }
};
/* 
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Validación: permitir solo ciertos campos
    const allowedUpdates = [
      "name",
      "email",
      "description",
      "profile_image",
      "phone"
    ];
    const validUpdates = Object.keys(updates).filter((key) =>
      allowedUpdates.includes(key)
    );

    if (validUpdates.length === 0) {
      return errorResponse(res, "No valid fields provided for update.", 400);
    }

    const updatedUser = await User.update(req.user.id, updates);

    return successResponse(res, {
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return errorResponse(res, "Failed to update profile.");
  }
};
 */

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Lista de campos permitidos para actualizar
    const allowedUpdates = [
      "name",
      "email",
      "description",
      "profile_image",
      "phone"
    ];
    const validUpdates = Object.keys(updates).filter((key) =>
      allowedUpdates.includes(key)
    );

    if (validUpdates.length === 0) {
      return errorResponse(res, "No valid fields provided for update.", 400);
    }

    // Validación adicional (ejemplo: formato de email)
    if (updates.email && !/\S+@\S+\.\S+/.test(updates.email)) {
      return errorResponse(res, "Invalid email format.", 400);
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

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, error: "Refresh token is missing" });
    }

    // Verificar si el refresh token existe en la base de datos
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

    // Generar un nuevo access token
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
