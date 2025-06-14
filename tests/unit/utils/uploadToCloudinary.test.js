import { jest } from "@jest/globals";

jest.unstable_mockModule("streamifier", () => ({
  default: {
    createReadStream: jest.fn()
  }
}));

jest.unstable_mockModule("../../../src/config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: jest.fn()
    }
  }
}));

const { uploadToCloudinary } = await import(
  "../../../src/utils/uploadToCloudinary.js"
);
const { default: streamifier } = await import("streamifier");
const { default: cloudinary } = await import(
  "../../../src/config/cloudinary.js"
);

describe("uploadToCloudinary", () => {
  it("should resolve with result from cloudinary", async () => {
    const mockStream = { pipe: jest.fn() };
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
    const mockStream = { pipe: jest.fn() };

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
