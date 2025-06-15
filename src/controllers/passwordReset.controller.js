import crypto from "crypto";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, "Email is required.", 400);

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user) {
      return successResponse(res, {
        message: "If the email exists, you will receive instructions."
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await Token.createPasswordReset(user.id, token, expiresAt);

    return successResponse(res, {
      message: "Reset token generated.",
      token // El frontend lo envía por emailJS
    });
  } catch (error) {
    console.error("Error generating reset token:", error);
    return errorResponse(res, "Failed to generate reset token.", 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return errorResponse(res, "Token and new password are required.", 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(
        res,
        "Password must be at least 8 characters long.",
        400
      );
    }

    const record = await Token.findPasswordResetByToken(token);
    if (!record || record.expires_at < new Date()) {
      return errorResponse(res, "Token is invalid or expired.", 400);
    }

    await User.updateSensitiveData(record.user_id, null, {
      newPassword
    });

    await Token.deletePasswordReset(record.user_id);

    return successResponse(res, "Password has been reset successfully.");
  } catch (error) {
    console.error("Error resetting password:", error);
    return errorResponse(res, "Failed to reset password.", 500);
  }
};
