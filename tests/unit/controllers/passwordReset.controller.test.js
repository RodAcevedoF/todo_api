import { describe, it, expect, vi, beforeEach } from "vitest";
import * as controller from "../../../src/controllers/passwordReset.controller.js";
import Token from "../../../src/models/Token.js";
import User from "../../../src/models/User.js";
import crypto from "crypto";

vi.mock("crypto");
vi.mock("../../../src/models/Token.js");
vi.mock("../../../src/models/User.js");

describe("Password Reset Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    vi.clearAllMocks();
  });

  describe("requestPasswordReset", () => {
    it("should return 400 if no email provided", async () => {
      await controller.requestPasswordReset(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email is required."
      });
    });

    it("should return generic success if user not found", async () => {
      req.body.email = "user@example.com";
      User.findByEmail.mockResolvedValue(null);

      await controller.requestPasswordReset(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: "If the email exists, you will receive instructions."
        }
      });
    });

    it("should generate token and return it", async () => {
      req.body.email = "user@example.com";
      const mockUser = { id: 1 };
      User.findByEmail.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue({
        toString: () => "abc123"
      });

      Token.createPasswordReset.mockResolvedValue();

      await controller.requestPasswordReset(req, res);

      expect(Token.createPasswordReset).toHaveBeenCalledWith(
        1,
        "abc123",
        expect.any(Date)
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: "Reset token generated.",
          token: "abc123"
        }
      });
    });

    it("should return 500 on error", async () => {
      req.body.email = "user@example.com";
      User.findByEmail.mockRejectedValue(new Error("DB error"));

      await controller.requestPasswordReset(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to generate reset token."
      });
    });
  });

  describe("resetPassword", () => {
    it("should return 400 if token or newPassword is missing", async () => {
      req.body = {};
      await controller.resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Token and new password are required."
      });
    });

    it("should return 400 if newPassword is too short", async () => {
      req.body = { token: "abc123", newPassword: "short" };
      await controller.resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    });

    it("should return 400 if token is invalid or expired", async () => {
      req.body = { token: "abc123", newPassword: "longenough" };
      Token.findPasswordResetByToken.mockResolvedValue(null);

      await controller.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Token is invalid or expired."
      });
    });

    it("should update password and delete token", async () => {
      req.body = { token: "abc123", newPassword: "longenough" };
      const record = {
        user_id: 1,
        expires_at: new Date(Date.now() + 1000)
      };
      Token.findPasswordResetByToken.mockResolvedValue(record);
      User.updateSensitiveData.mockResolvedValue();
      Token.deletePasswordReset.mockResolvedValue();

      await controller.resetPassword(req, res);

      expect(User.updateSensitiveData).toHaveBeenCalledWith(1, null, {
        newPassword: "longenough"
      });
      expect(Token.deletePasswordReset).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: "Password has been reset successfully."
      });
    });

    it("should return 500 on reset error", async () => {
      req.body = { token: "abc123", newPassword: "longenough" };
      Token.findPasswordResetByToken.mockRejectedValue(new Error("DB error"));

      await controller.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to reset password."
      });
    });
  });
});
