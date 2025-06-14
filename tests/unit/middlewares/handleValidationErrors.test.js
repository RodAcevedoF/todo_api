import { jest } from "@jest/globals";

const mockValidationResult = jest.fn();

// Mockeamos express-validator antes de importar el middleware
jest.unstable_mockModule("express-validator", () => ({
  validationResult: mockValidationResult
}));

// Importamos después del mock (ESM flow)
const { handleValidationErrors } = await import(
  "../../../src/middlewares/validation"
);

describe("handleValidationErrors", () => {
  it("should call next() if no validation errors", () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    mockValidationResult.mockReturnValue({ isEmpty: () => true });

    handleValidationErrors(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return 400 with error messages if there are validation errors", () => {
    const req = {};
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };
    const next = jest.fn();

    const fakeErrors = [
      { msg: "Title is required" },
      { msg: "URL is invalid" }
    ];

    mockValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => fakeErrors
    });

    handleValidationErrors(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      errors: ["Title is required", "URL is invalid"]
    });
    expect(next).not.toHaveBeenCalled();
  });
});
