import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import * as controller from "../../../src/controllers/auth.controller.js";
import User from "../../../src/models/User.js";
import Token from "../../../src/models/Token.js";
import { validationResult } from "express-validator";

vi.mock("express-validator");
vi.mock("jsonwebtoken");

describe("AuthController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      header: vi.fn(),
      userId: 1
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    vi.clearAllMocks();
    validationResult.mockReturnValue({ isEmpty: () => true });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      req.body = { email: "test@test.com", password: "12345678" };
      const user = {
        id: 1,
        name: "Test",
        email: "test@test.com",
        nickname: "tester",
        password: "hashed",
        is_verified: true
      };

      vi.spyOn(User, "findByEmail").mockResolvedValue(user);
      vi.spyOn(User, "comparePassword").mockResolvedValue(true);
      vi.spyOn(User, "generateToken").mockReturnValue("accessToken");
      vi.spyOn(Token, "deleteRefreshTokensByUserId").mockResolvedValue();
      vi.spyOn(Token, "saveRefreshToken").mockResolvedValue();
      vi.spyOn(User, "updateLastLogin").mockResolvedValue();
      jwt.sign.mockReturnValue("refreshToken");

      await controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: 1,
            name: "Test",
            email: "test@test.com",
            nickname: "tester",
            is_verified: true
          },
          accessToken: "accessToken",
          refreshToken: "refreshToken"
        }
      });
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      req.header = vi.fn().mockReturnValue("Bearer accessToken");
      req.body.refreshToken = "refreshToken";

      vi.spyOn(Token, "isBlacklisted").mockResolvedValue(false);
      vi.spyOn(Token, "blacklistToken").mockResolvedValue();
      vi.spyOn(Token, "deleteRefreshToken").mockResolvedValue();

      await controller.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: "Logged out successfully."
      });
    });
  });

  describe("refreshAccessToken", () => {
    it("should refresh token successfully", async () => {
      req.body.refreshToken = "oldRefresh";
      req.userId = 1;

      jwt.sign
        .mockReturnValueOnce("newAccessToken")
        .mockReturnValueOnce("newRefreshToken");

      vi.spyOn(Token, "deleteRefreshToken").mockResolvedValue();
      vi.spyOn(Token, "saveRefreshToken").mockResolvedValue();

      await controller.refreshAccessToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          accessToken: "newAccessToken",
          refreshToken: "newRefreshToken"
        }
      });
    });
  });

  describe("ping", () => {
    it("should return token is valid", async () => {
      await controller.ping(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: "Token is valid."
      });
    });
  });
});
