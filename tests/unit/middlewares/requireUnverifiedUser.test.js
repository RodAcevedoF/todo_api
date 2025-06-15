// tests/unit/middlewares/requireUnverifiedUser.test.js
import { describe, it, expect, vi } from "vitest";
import { requireUnverifiedUser } from "../../../src/middlewares/requireUnverifiedUser.js";

describe("requireUnverifiedUser", () => {
  it("should call next() if user is not verified", () => {
    const req = { user: { is_verified: false } };
    const res = {};
    const next = vi.fn();

    requireUnverifiedUser(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if user is verified", () => {
    const req = { user: { is_verified: true } };
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const res = { status };
    const next = vi.fn();

    requireUnverifiedUser(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Your account is already verified."
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if user is missing", () => {
    const req = {};
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const res = { status };
    const next = vi.fn();

    requireUnverifiedUser(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Your account is already verified."
    });
    expect(next).not.toHaveBeenCalled();
  });
});
