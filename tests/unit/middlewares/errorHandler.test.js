import { jest } from "@jest/globals";
import { errorHandler } from "../../../src/middlewares/errorHandler.js";

describe("errorHandler", () => {
  const createMockRes = () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { status, json };
  };

  it("should handle TokenExpiredError", () => {
    const err = { name: "TokenExpiredError" };
    const req = {};
    const res = createMockRes();
    const next = jest.fn();

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

    errorHandler(err, req, res, jest.fn());

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

    errorHandler(err, req, res, jest.fn());

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

    errorHandler(err, req, res, jest.fn());

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

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.status().json).toHaveBeenCalledWith({
      success: false,
      message: "I’m a message"
    });
  });
});
