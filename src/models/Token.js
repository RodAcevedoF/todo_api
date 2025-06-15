import db from "../config/db.js";
import { hashToken } from "../utils/hashToken.js";

class Token {
  // Refresh Tokens
  static async deleteRefreshTokensByUserId(userId) {
    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
  }

  static async saveRefreshToken(token, userId) {
    const hashed = hashToken(token);
    await db.query(
      "INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)",
      [hashed, userId]
    );
  }

  static async findRefreshToken(token) {
    const hashed = hashToken(token);
    const { rows } = await db.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [hashed]
    );
    return rows[0];
  }

  static async deleteRefreshToken(token) {
    const hashed = hashToken(token);
    await db.query("DELETE FROM refresh_tokens WHERE token = $1", [hashed]);
  }

  // Token Blacklist
  static async isBlacklisted(token) {
    const { rows } = await db.query(
      "SELECT token FROM blacklisted_tokens WHERE token = $1",
      [token]
    );
    return rows.length > 0;
  }

  static async blacklistToken(token) {
    await db.query("INSERT INTO blacklisted_tokens (token) VALUES ($1)", [
      token
    ]);
  }

  // Email Verification
  static async createEmailVerification(userId, token, expiresAt) {
    const hashed = hashToken(token);
    await db.query(
      `INSERT INTO email_verifications (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, hashed, expiresAt]
    );
  }

  static async findEmailVerificationByToken(token) {
    const hashed = hashToken(token);
    const { rows } = await db.query(
      `SELECT * FROM email_verifications WHERE token = $1`,
      [hashed]
    );
    return rows[0];
  }

  static async deleteEmailVerification(userId) {
    await db.query("DELETE FROM email_verifications WHERE user_id = $1", [
      userId
    ]);
  }

  // Password Reset
  static async createPasswordReset(userId, token, expiresAt) {
    const hashed = hashToken(token);
    await db.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, hashed, expiresAt]
    );
  }

  static async findPasswordResetByToken(token) {
    const hashed = hashToken(token);
    const { rows } = await db.query(
      `SELECT * FROM password_resets WHERE token = $1`,
      [hashed]
    );
    return rows[0];
  }

  static async deletePasswordReset(userId) {
    await db.query("DELETE FROM password_resets WHERE user_id = $1", [userId]);
  }
}

export default Token;
