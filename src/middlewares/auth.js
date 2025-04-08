/* import jwt from "jsonwebtoken";
import db from "../config/db.js";
import User from "../models/User.js";
import { errorResponse } from "../utils/apiResponse.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return errorResponse(res, "Authentication token missing", 401);
    }

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, "Invalid or expired token", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Token has expired. Please log in again.", 401);
    }
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, "Invalid token. Please log in again.", 401);
    }
    errorResponse(res, "Authentication failed", 401);
  }
};
 */
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { errorResponse } from "../utils/apiResponse.js";

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

    // Verificar el refresh token con el secreto correspondiente
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Adjuntar el usuario (ID) decodificado al objeto de la solicitud
    req.userId = decoded.id;
    next();
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
