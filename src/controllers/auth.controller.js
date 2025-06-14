import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import * as Token from "../models/Token.js";
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
    const userId = req.userId; // viene del middleware

    if (!refreshToken || typeof refreshToken !== "string") {
      return errorResponse(res, "Refresh token is missing or invalid.", 400);
    }

    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "15m"
    });

    const newRefreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || "7d" }
    );

    await Token.deleteRefreshToken(refreshToken);
    await Token.saveRefreshToken(newRefreshToken, userId);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (err) {
    console.error("Error al refrescar token:", err);
    return errorResponse(res, "Failed to refresh token.", 500);
  }
};

export const ping = async (req, res) => {
  return successResponse(res, "Token is valid.");
};
