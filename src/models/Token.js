import db from "../config/db.js";
import { hashToken } from "../utils/hashToken.js";

const Token = {
  // -------- REFRESH TOKENS --------
  deleteRefreshTokensByUserId: async (userId) => {
    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
  },

  saveRefreshToken: async (token, userId) => {
    const hashed = hashToken(token);
    await db.query(
      "INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)",
      [hashed, userId]
    );
  },

  findRefreshToken: async (token) => {
    const hashed = hashToken(token);
    const { rows } = await db.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [hashed]
    );
    return rows[0];
  },

  deleteRefreshToken: async (token) => {
    const hashed = hashToken(token);
    await db.query("DELETE FROM refresh_tokens WHERE token = $1", [hashed]);
  },

  // -------- BLACKLISTED TOKENS --------
  isBlacklisted: async (token) => {
    const { rows } = await db.query(
      "SELECT token FROM blacklisted_tokens WHERE token = $1",
      [token]
    );
    return rows.length > 0;
  },

  blacklistToken: async (token) => {
    await db.query("INSERT INTO blacklisted_tokens (token) VALUES ($1)", [
      token
    ]);
  },

  // -------- EMAIL VERIFICATION --------
  createEmailVerification: async (userId, token, expiresAt) => {
    const hashed = hashToken(token);
    await db.query(
      `INSERT INTO email_verifications (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, hashed, expiresAt]
    );
  },

  findEmailVerificationByToken: async (token) => {
    const hashed = hashToken(token);
    const { rows } = await db.query(
      `SELECT * FROM email_verifications WHERE token = $1`,
      [hashed]
    );
    return rows[0];
  },

  deleteEmailVerification: async (userId) => {
    await db.query("DELETE FROM email_verifications WHERE user_id = $1", [
      userId
    ]);
  },

  // --- PASSWORD RESET ---
  createPasswordReset: async (userId, token, expiresAt) => {
    const hashed = hashToken(token);
    await db.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, hashed, expiresAt]
    );
  },

  findPasswordResetByToken: async (token) => {
    const hashed = hashToken(token);
    const { rows } = await db.query(
      `SELECT * FROM password_resets WHERE token = $1`,
      [hashed]
    );
    return rows[0];
  },

  deletePasswordReset: async (userId) => {
    await db.query("DELETE FROM password_resets WHERE user_id = $1", [userId]);
  }
};

export default Token;
