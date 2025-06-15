import { describe, it, expect } from "vitest";
import { isValidUrl } from "../../../src/utils/isValidUrl.js";

describe("isValidUrl", () => {
  it("should return true for a valid http URL", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("should return true for a valid https URL", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("should return false for unsupported protocols", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });

  it("should return false for invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl(null)).toBe(false);
    expect(isValidUrl(undefined)).toBe(false);
  });
});
