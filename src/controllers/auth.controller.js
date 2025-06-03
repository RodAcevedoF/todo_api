import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Token from "../models/Token.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const login = async (req, res) => {
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
    const sanitizedEmail = email.trim().toLowerCase();
    const user = await User.findByEmail(sanitizedEmail);

    if (!user || !(await User.comparePassword(password, user.password))) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    if (!user.is_verified) {
      return errorResponse(res, "You must verify your email first.", 403);
    }

    const accessToken = User.generateToken(user);
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || "7d" }
    );

    await Token.deleteRefreshTokensByUserId(user.id);
    await Token.saveRefreshToken(refreshToken, user.id);
    await User.updateLastLogin(user.id);

    return successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        is_verified: user.is_verified
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Error during login:", error);
    return errorResponse(res, "Failed to log in. Please try again.", 500);
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const { refreshToken } = req.body;

    if (!token || !refreshToken) {
      return errorResponse(res, "Access token or refresh token missing.", 400);
    }

    const isBlacklisted = await Token.isBlacklisted(token);
    if (isBlacklisted) {
      return errorResponse(res, "Token is already invalidated.", 400);
    }

    await Token.blacklistToken(token);
    await Token.deleteRefreshToken(refreshToken);

    return successResponse(res, "Logged out successfully.");
  } catch (error) {
    console.error("Error during logout:", error);
    return errorResponse(res, "Failed to log out.", 500);
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== "string") {
      return errorResponse(res, "Refresh token is missing or invalid.", 400);
    }

    const tokenRecord = await Token.findRefreshToken(refreshToken);
    if (!tokenRecord) {
      return errorResponse(res, "Invalid refresh token.", 401);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.id;

    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "3m"
    });

    // 🔁 Generar nuevo refreshToken
    const newRefreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || "7d" }
    );

    // 🔁 Reemplazar el viejo token en la base
    await Token.deleteRefreshToken(refreshToken);
    await Token.saveRefreshToken(newRefreshToken, userId);
    console.log("Nuevo refresh token guardado correctamente.");

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken // 👈 clave
      }
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Refresh token expired.", 401);
    }
    return errorResponse(res, "Invalid refresh token.", 401);
  }
};
