import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { errorHandler } from "../../../src/middlewares/errorHandler.js";

describe("errorHandler", () => {
  const createMockRes = () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    return { status, json };
  };

  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.clearAllMocks();
  });

  it("should handle TokenExpiredError", () => {
    const err = { name: "TokenExpiredError" };
    const req = {};
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      message: "Token expired. Please log in again."
    });
  });

  it("should handle JsonWebTokenError", () => {
    const err = { name: "JsonWebTokenError" };
    const req = {};
    const res = createMockRes();

    errorHandler(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token. Please log in again."
    });
  });

  it("should handle MulterError", () => {
    const err = { name: "MulterError", message: "File too large" };
    const req = {};
    const res = createMockRes();

    errorHandler(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      message: "File too large"
    });
  });

  it("should handle generic error in development", () => {
    process.env.NODE_ENV = "development";

    const err = new Error("Something went wrong");
    const req = {};
    const res = createMockRes();

    errorHandler(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      stack: err.stack
    });
  });

  it("should handle custom status code and message", () => {
    process.env.NODE_ENV = "production";

    const err = { status: 418, message: "I’m a message" };
    const req = {};
    const res = createMockRes();

    errorHandler(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      message: "I’m a message"
    });
  });
});
