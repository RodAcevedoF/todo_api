import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks de dependencias externas
vi.mock("streamifier", () => ({
  default: {
    createReadStream: vi.fn()
  }
}));

vi.mock("../../../src/config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: vi.fn()
    }
  }
}));

import { uploadToCloudinary } from "../../../src/utils/uploadToCloudinary.js";
import streamifier from "streamifier";
import cloudinary from "../../../src/config/cloudinary.js";

describe("uploadToCloudinary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should resolve with result from cloudinary", async () => {
    const mockStream = { pipe: vi.fn() };
    const fileBuffer = Buffer.from("fake image");

    streamifier.createReadStream.mockReturnValue(mockStream);

    cloudinary.uploader.upload_stream.mockImplementation(
      (options, callback) => {
        process.nextTick(() =>
          callback(null, { url: "http://fake.url/image.jpg" })
        );
        return mockStream;
      }
    );

    const result = await uploadToCloudinary(fileBuffer);
    expect(result).toEqual({ url: "http://fake.url/image.jpg" });
  });

  it("should reject if cloudinary returns an error", async () => {
    const fileBuffer = Buffer.from("bad image");
    const mockStream = { pipe: vi.fn() };

    streamifier.createReadStream.mockReturnValue(mockStream);

    cloudinary.uploader.upload_stream.mockImplementation(
      (options, callback) => {
        process.nextTick(() => callback(new Error("Upload failed"), null));
        return mockStream;
      }
    );

    await expect(uploadToCloudinary(fileBuffer)).rejects.toThrow(
      "Upload failed"
    );
  });
});
