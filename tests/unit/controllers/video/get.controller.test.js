import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../../src/models/Video.js", () => ({
  default: { create: jest.fn() }
}));

jest.unstable_mockModule("../../../../src/utils/apiResponse.js", () => ({
  successResponse: jest.fn((res, data, code = 200) =>
    res.status(code).json({ success: true, data })
  ),
  errorResponse: jest.fn((res, message, code = 500) =>
    res.status(code).json({ success: false, error: message })
  )
}));

jest.unstable_mockModule("express-validator", () => ({
  validationResult: jest.fn()
}));

const { createVideo } = await import(
  "../../../../src/controllers/video.controller.js"
);
const { default: Video } = await import("../../../../src/models/Video.js");
const { successResponse, errorResponse } = await import(
  "../../../../src/utils/apiResponse.js"
);
const { validationResult } = await import("express-validator");

const mockRes = () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json };
};

describe("createVideo controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if video_id is missing", async () => {
    const req = { body: {}, user: { id: "user123" } };
    const res = mockRes();

    await createVideo(req, res);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "ID field is required",
      400
    );
  });

  it("should return 400 if express-validator has errors", async () => {
    const req = {
      body: { video_id: "abc123", channelId: "" },
      user: { id: "user123" }
    };
    const res = mockRes();

    validationResult.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: "Invalid input" }]
    });

    await createVideo(req, res);

    expect(errorResponse).toHaveBeenCalledWith(res, ["Invalid input"], 400);
  });

  it("should create video and return 201", async () => {
    const mockVideo = { id: "vid123", title: "Test" };
    Video.create.mockResolvedValue(mockVideo);

    const req = {
      body: {
        video_id: "abc123",
        views: "10",
        duration_seconds: "30",
        checked: "true"
      },
      user: { id: "user123" },
      file: { filename: "thumb.jpg" }
    };
    const res = mockRes();

    validationResult.mockReturnValueOnce({
      isEmpty: () => true
    });

    await createVideo(req, res);

    expect(Video.create).toHaveBeenCalled();
    expect(successResponse).toHaveBeenCalledWith(res, mockVideo, 201);
  });

  it("should handle errors and return 500", async () => {
    Video.create.mockRejectedValue(new Error("fail"));

    const req = {
      body: { video_id: "abc123" },
      user: { id: "user123" }
    };
    const res = mockRes();

    validationResult.mockReturnValueOnce({
      isEmpty: () => true
    });

    await createVideo(req, res);

    expect(errorResponse).toHaveBeenCalledWith(res, "fail");
  });
});
