import { jest } from "@jest/globals";

const multerMockError = new Error("Multer failed");
const uploadToCloudinaryMock = jest.fn();

jest.unstable_mockModule("multer", () => ({
  default: {
    MulterError: class extends Error {}
  }
}));

jest.unstable_mockModule("../../../src/utils/uploadToCloudinary.js", () => ({
  uploadToCloudinary: uploadToCloudinaryMock
}));

// Mocks para upload config
const mockUploader = jest.fn();
jest.unstable_mockModule("../../../src/config/upload.js", () => ({
  default: {
    single: () => mockUploader
  }
}));

// Reimportamos después de mocks
const { uploadMiddleware } = await import(
  "../../../src/middlewares/uploadMiddleware.js"
);
const { default: multer } = await import("multer");

describe("uploadMiddleware", () => {
  beforeEach(() => {
    mockUploader.mockReset();
    uploadToCloudinaryMock.mockReset();
  });

  it("should handle multer error", async () => {
    const req = {};
    const res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    const next = jest.fn();

    mockUploader.mockImplementation((req, res, cb) =>
      cb(new multer.MulterError("LIMIT_FILE_SIZE"))
    );

    await uploadMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("Multer error")
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle no file case", async () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    mockUploader.mockImplementation((req, res, cb) => {
      req.file = null;
      cb(null);
    });

    await uploadMiddleware(req, res, next);
    expect(req.fileUrl).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it("should upload file to cloudinary and set req fields", async () => {
    const req = { file: { buffer: Buffer.from("image") } };
    const res = {};
    const next = jest.fn();

    mockUploader.mockImplementation((req, res, cb) => cb(null));

    uploadToCloudinaryMock.mockResolvedValue({
      secure_url: "https://cloudinary.com/fake.jpg",
      public_id: "abc123"
    });

    await uploadMiddleware(req, res, next);

    expect(req.fileUrl).toBe("https://cloudinary.com/fake.jpg");
    expect(req.filePublicId).toBe("abc123");
    expect(next).toHaveBeenCalled();
  });
});
