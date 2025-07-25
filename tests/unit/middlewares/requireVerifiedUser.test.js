// tests/unit/middlewares/requireVerifiedUser.test.js
import { describe, it, expect, vi } from "vitest";
import { requireVerifiedUser } from "../../../src/middlewares/requireVerifiedUser.js";

describe("requireVerifiedUser", () => {
  it("should call next() if user is verified", () => {
    const req = { user: { is_verified: true } };
    const res = {};
    const next = vi.fn();

    requireVerifiedUser(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if user is not verified", () => {
    const req = { user: { is_verified: false } };
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const res = { status };
    const next = vi.fn();

    requireVerifiedUser(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Access denied. Email not verified."
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if user is missing", () => {
    const req = {};
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const res = { status };
    const next = vi.fn();

    requireVerifiedUser(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Access denied. Email not verified."
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle unexpected error and return 500", () => {
    const req = null;
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const res = { status };
    const next = vi.fn();

    requireVerifiedUser(req, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Something went wrong while checking verification."
    });
    expect(next).not.toHaveBeenCalled();
  });
});
