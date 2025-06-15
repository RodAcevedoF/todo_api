import { describe, it, expect } from "vitest";
import { normalizeUserUpdate } from "../../../src/utils/normalizeUserUpdates";

describe("normalizeUserUpdate", () => {
  it("should convert empty strings to null", () => {
    const input = { name: "", email: "", website: "" };
    const result = normalizeUserUpdate(input);
    expect(result).toEqual({ name: null, email: null, website: null });
  });

  it("should keep valid values and ignore non-url fields", () => {
    const input = { name: "Jane", email: "jane@example.com" };
    const result = normalizeUserUpdate(input);
    expect(result).toEqual(input);
  });

  it("should throw if email is invalid", () => {
    const input = { email: "invalid-email" };
    expect(() => normalizeUserUpdate(input)).toThrow("Invalid email format.");
  });

  it("should throw if url fields are invalid", () => {
    const input = { website: "notaurl", github_url: "http://valid.com" };
    expect(() => normalizeUserUpdate(input)).toThrow(
      "Invalid URL format for website"
    );
  });

  it("should pass with valid URLs and email", () => {
    const input = {
      email: "user@example.com",
      website: "https://example.com",
      github_url: "https://github.com/user",
      linkedin_url: "https://linkedin.com/in/user",
      instagram_url: "https://instagram.com/user"
    };
    const result = normalizeUserUpdate(input);
    expect(result).toEqual(input);
  });
});
