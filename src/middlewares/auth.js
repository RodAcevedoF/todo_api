import jwt from "jsonwebtoken";
import db from "../config/db.js";
import User from "../models/User.js";
import { errorResponse } from "../utils/apiResponse.js";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Middleware para autenticación
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return errorResponse(res, "Authentication token missing", 401);
    }

    // Verificar si el token está en la lista negra
    const { rows } = await db.query(
      "SELECT 1 FROM blacklisted_tokens WHERE token = $1",
      [token]
    );
    if (rows.length > 0) {
      return errorResponse(
        res,
        "Token has been invalidated. Please log in again.",
        401
      );
    }

    // Verificación del token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el ID en el token es un UUID válido
    if (!uuidRegex.test(decoded.id)) {
      return errorResponse(res, "Invalid user ID in token", 401);
    }

    // Obtener el usuario asociado al ID decodificado
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, "Invalid or expired token", 401);
    }

    // Asignar el usuario al objeto `req.user`
    req.user = user;
    next(); // Continuar con la siguiente función de middleware o ruta
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Token has expired. Please log in again.", 401);
    }
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, "Invalid token. Please log in again.", 401);
    }
    return errorResponse(res, "Authentication failed", 401);
  }
};

// Middleware para validar el refresh token
export const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, "Refresh token is missing.", 401);
    }

    // Verificar si el refresh token existe en la base de datos
    const { rows } = await db.query(
      "SELECT token FROM refresh_tokens WHERE token = $1",
      [refreshToken]
    );

    if (rows.length === 0) {
      return errorResponse(res, "Invalid refresh token.", 401);
    }

    // Verificación del refresh token con el secreto correspondiente
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Verificar que el ID en el refresh token es un UUID válido
    if (!uuidRegex.test(decoded.id)) {
      return errorResponse(res, "Invalid user ID in refresh token", 401);
    }

    // Asignar el ID del usuario al objeto de la solicitud para usarlo en la siguiente operación
    req.userId = decoded.id;
    next(); // Continuar con la siguiente función de middleware o ruta
  } catch (error) {
    console.error("Refresh token validation error:", error);
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        "Refresh token has expired. Please log in again.",
        401
      );
    }
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, "Invalid refresh token.", 401);
    }
    return errorResponse(res, "Failed to validate refresh token.", 500);
  }
};
