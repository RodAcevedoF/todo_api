import { jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jest.fn()
  }
}));

jest.unstable_mockModule("../../../src/config/db.js", () => ({
  default: {
    query: jest.fn()
  }
}));

jest.unstable_mockModule("../../../src/models/User.js", () => ({
  default: {
    findById: jest.fn()
  }
}));

jest.unstable_mockModule("../../../src/models/Token.js", () => ({
  default: {
    findRefreshToken: jest.fn()
  }
}));

jest.unstable_mockModule("../../../src/utils/apiResponse.js", () => ({
  errorResponse: jest.fn((res, message, code) =>
    res.status(code).json({ success: false, error: message })
  )
}));

const { authenticate, validateRefreshToken } = await import(
  "../../../src/middlewares/auth.js"
);
const jwt = (await import("jsonwebtoken")).default;
const db = (await import("../../../src/config/db.js")).default;
const User = (await import("../../../src/models/User.js")).default;
const Token = (await import("../../../src/models/Token.js")).default;
const { errorResponse } = await import("../../../src/utils/apiResponse.js");

describe("authenticate middleware", () => {
  const mockRes = () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { status, json };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no token", async () => {
    const req = { header: () => null };
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Authentication token missing",
      401
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token blacklisted", async () => {
    const req = { header: () => "Bearer tok" };
    const res = mockRes();
    const next = jest.fn();

    db.query.mockResolvedValue({ rows: [1] });

    await authenticate(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Token has been invalidated. Please log in again.",
      401
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 on invalid jwt verify", async () => {
    const req = { header: () => "Bearer tok" };
    const res = mockRes();
    const next = jest.fn();

    db.query.mockResolvedValue({ rows: [] });
    jwt.verify.mockImplementation(() => {
      const err = new Error("Fake JsonWebTokenError");
      err.name = "JsonWebTokenError";
      throw err;
    });

    await authenticate(req, res, next);
    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Invalid token. Please log in again.",
      401
    );
  });

  it("should return 401 if user not found", async () => {
    const req = { header: () => "Bearer tok" };
    const res = mockRes();
    const next = jest.fn();

    db.query.mockResolvedValue({ rows: [] });
    jwt.verify.mockReturnValue({ id: "550e8400-e29b-41d4-a716-446655440000" });
    User.findById.mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(errorResponse.mock.calls[0][1]).toBe("Invalid or expired token");
  });

  it("should call next() and set req.user on success", async () => {
    const userObj = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      is_verified: true
    };
    const req = { header: () => "Bearer tok" };
    const res = mockRes();
    const next = jest.fn();

    db.query.mockResolvedValue({ rows: [] });
    jwt.verify.mockReturnValue({ id: userObj.id });
    User.findById.mockResolvedValue(userObj);

    await authenticate(req, res, next);

    expect(req.user).toEqual(userObj);
    expect(next).toHaveBeenCalled();
  });
});

describe("validateRefreshToken middleware", () => {
  const mockRes = () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { status, json };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token missing or not a string", async () => {
    const req = { body: { refreshToken: 123 } };
    const res = mockRes();
    const next = jest.fn();

    await validateRefreshToken(req, res, next);
    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Refresh token is missing or invalid.",
      401
    );
  });

  it("should return 401 if token not found in db", async () => {
    const req = { body: { refreshToken: "abc" } };
    const res = mockRes();
    const next = jest.fn();

    Token.findRefreshToken.mockResolvedValue(null);

    await validateRefreshToken(req, res, next);
    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Invalid refresh token.",
      401
    );
  });

  it("should return 401 if jwt verify invalid", async () => {
    const req = { body: { refreshToken: "abc" } };
    const res = mockRes();
    const next = jest.fn();

    Token.findRefreshToken.mockResolvedValue({ token: "abc" });
    jwt.verify.mockImplementation(() => {
      const err = new Error("Fake JsonWebTokenError");
      err.name = "JsonWebTokenError";
      throw err;
    });

    await validateRefreshToken(req, res, next);
    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Invalid refresh token.",
      401
    );
  });

  it("should next() on valid refresh token", async () => {
    const decoded = { id: "550e8400-e29b-41d4-a716-446655440000" };
    const req = { body: { refreshToken: "abc" } };
    const res = mockRes();
    const next = jest.fn();

    Token.findRefreshToken.mockResolvedValue({ token: "abc" });
    jwt.verify.mockReturnValue(decoded);

    await validateRefreshToken(req, res, next);

    expect(req.userId).toBe(decoded.id);
    expect(next).toHaveBeenCalled();
  });
});
