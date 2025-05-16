import crypto from "crypto";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
// ✅ Paso 1: crear token y devolverlo al frontend para que lo envíe con EmailJS
export const requestEmailVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🔐 req.user:", req.user);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await Token.createEmailVerification(userId, token, expiresAt);

    // El frontend usa esto para incluir el token en el email
    return successResponse(res, {
      message: "Verification token generated.",
      token
    });
  } catch (error) {
    console.error("Error generating verification token:", error);
    return errorResponse(res, "Failed to generate verification token.", 500);
  }
};

// ✅ Paso 2: validar el token cuando el usuario entra al link
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/verify?status=invalid`);
    }

    const record = await Token.findEmailVerificationByToken(token);

    if (!record || record.expires_at < new Date()) {
      return res.redirect(`${process.env.FRONTEND_URL}/verify?status=invalid`);
    }

    const user = await User.findById(record.user_id);

    if (user?.is_verified) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/verify?status=already_verified`
      );
    }

    await User.update(record.user_id, { is_verified: true });
    await Token.deleteEmailVerification(record.user_id);

    return res.redirect(`${process.env.FRONTEND_URL}/verify?status=success`);
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/verify?status=invalid`);
  }
};
