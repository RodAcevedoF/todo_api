import { describe, it, expect, vi, beforeEach } from "vitest";
import * as controller from "../../../src/controllers/emailVerification.controller.js";
import Token from "../../../src/models/Token.js";
import User from "../../../src/models/User.js";

vi.mock("crypto", () => ({
  default: {
    randomBytes: () => Buffer.from("abc123") // token simulado
  }
}));

vi.mock("../../../src/models/Token.js");
vi.mock("../../../src/models/User.js");

describe("Email Verification Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1 }, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      redirect: vi.fn()
    };

    vi.clearAllMocks();
  });

  describe("requestEmailVerification", () => {
    it("should generate token and return it", async () => {
      await controller.requestEmailVerification(req, res);

      expect(Token.createEmailVerification).toHaveBeenCalledWith(
        1,
        "616263313233", // hex de "abc123"
        expect.any(Date)
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: "Verification token generated.",
          token: "616263313233"
        }
      });
    });

    it("should return 500 on error", async () => {
      Token.createEmailVerification.mockRejectedValue(new Error("DB Error"));

      await controller.requestEmailVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to generate verification token."
      });
    });
  });

  describe("verifyEmail", () => {
    const FRONTEND_URL = "http://localhost:3000";
    beforeEach(() => {
      process.env.FRONTEND_URL = FRONTEND_URL;
    });

    it("should verify email and redirect to success", async () => {
      req.query.token = "abc";
      Token.findEmailVerificationByToken.mockResolvedValue({
        user_id: 1,
        expires_at: new Date(Date.now() + 10000)
      });

      await controller.verifyEmail(req, res);

      expect(User.update).toHaveBeenCalledWith(1, { is_verified: true });
      expect(Token.deleteEmailVerification).toHaveBeenCalledWith(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${FRONTEND_URL}/verify?status=success`
      );
    });

    it("should redirect to invalid if token missing", async () => {
      req.query.token = null;

      await controller.verifyEmail(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `${FRONTEND_URL}/verify?status=invalid`
      );
    });

    it("should redirect to invalid if token is expired or not found", async () => {
      req.query.token = "abc";
      Token.findEmailVerificationByToken.mockResolvedValue({
        expires_at: new Date(Date.now() - 10000)
      });

      await controller.verifyEmail(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `${FRONTEND_URL}/verify?status=invalid`
      );
    });

    it("should redirect to invalid on error", async () => {
      req.query.token = "abc";
      Token.findEmailVerificationByToken.mockRejectedValue(new Error("fail"));

      await controller.verifyEmail(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `${FRONTEND_URL}/verify?status=invalid`
      );
    });
  });
});
