// tests/middleware/authenticate.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "../../../src/middlewares/auth";
import db from "../../../src/config/db";
import User from "../../../src/models/User";

vi.mock("jsonwebtoken");
vi.mock("../../../src/config/db");
vi.mock("../../../src/models/User");

describe("authenticate middleware", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get("/protected", authenticate, (req, res) => {
      res.status(200).json({ success: true, user: req.user });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("denies access if token is missing", async () => {
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Authentication token missing");
  });

  it("denies access if token is blacklisted", async () => {
    db.query.mockResolvedValueOnce({ rows: [{}] });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      "Token has been invalidated. Please log in again."
    );
  });

  it("denies access if token is invalid", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    jwt.verify.mockImplementation(() => {
      throw { name: "JsonWebTokenError" };
    });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid token. Please log in again.");
  });

  it("denies access if user not found", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    jwt.verify.mockReturnValue({
      id: "f47ac10b-58cc-4af8-8f03-420b1f1c9f1f"
    });
    // ✅ UUID válido
    User.findById.mockResolvedValue(null); // Fuerza que no se encuentre

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
  });

  it("grants access with valid token", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    jwt.verify.mockReturnValue({ id: "f47ac10b-58cc-4af8-8f03-420b1f1c9f1f" });
    User.findById.mockResolvedValue({ id: 1, name: "Test User" });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer good-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toEqual({ id: 1, name: "Test User" });
  });
});
