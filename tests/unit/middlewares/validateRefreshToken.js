// tests/middleware/validateRefreshToken.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { validateRefreshToken } from "../../../src/middlewares/auth";
import Token from "../../../src/models/Token";

vi.mock("jsonwebtoken");
vi.mock("../../../src/models/Token");

describe("validateRefreshToken middleware", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.post("/refresh", validateRefreshToken, (req, res) => {
      res.status(200).json({ success: true, userId: req.userId });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("denies access if refreshToken is missing", async () => {
    const res = await request(app).post("/refresh").send({});
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Refresh token is missing or invalid.");
  });

  it("denies access if refreshToken not in DB", async () => {
    Token.findRefreshToken.mockResolvedValue(null);

    const res = await request(app)
      .post("/refresh")
      .send({ refreshToken: "fake-token" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid refresh token.");
  });

  it("denies access if refreshToken is invalid JWT", async () => {
    Token.findRefreshToken.mockResolvedValue({ token: "fake-token" });
    jwt.verify.mockImplementation(() => {
      throw { name: "JsonWebTokenError" };
    });

    const res = await request(app)
      .post("/refresh")
      .send({ refreshToken: "fake-token" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid refresh token.");
  });

  it("denies access if UUID is invalid", async () => {
    Token.findRefreshToken.mockResolvedValue({ token: "fake-token" });
    jwt.verify.mockReturnValue({ id: "not-a-uuid" });

    const res = await request(app)
      .post("/refresh")
      .send({ refreshToken: "fake-token" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid user ID in refresh token");
  });

  it("grants access with valid refresh token", async () => {
    Token.findRefreshToken.mockResolvedValue({ token: "valid-refresh" });
    jwt.verify.mockReturnValue({ id: "123e4567-e89b-12d3-a456-426614174000" });

    const res = await request(app)
      .post("/refresh")
      .send({ refreshToken: "valid-refresh" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBe("123e4567-e89b-12d3-a456-426614174000");
  });
});
