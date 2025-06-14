import { jest } from "@jest/globals";

jest.unstable_mockModule("express-validator", () => ({
  validationResult: jest.fn()
}));

jest.unstable_mockModule("../../../../src/models/Video.js", () => ({
  default: { update: jest.fn() }
}));

jest.unstable_mockModule("../../../../src/utils/apiResponse.js", () => ({
  successResponse: jest.fn((res, data, code = 200) =>
    res.status(code).json({ success: true, data })
  ),
  errorResponse: jest.fn((res, message, code = 500) =>
    res.status(code).json({ success: false, error: message })
  )
}));

const { validationResult } = await import("express-validator");
const { default: Video } = await import("../../../../src/models/Video.js");
const { successResponse, errorResponse } = await import(
  "../../../../src/utils/apiResponse.js"
);
const { updateVideo } = await import(
  "../../../../src/controllers/video.controller.js"
);

const mockReqResNext = () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return {
    req: {
      params: { id: "vid123" },
      body: {},
      user: { id: "user123" },
      file: null
    },
    res: { status, json }
  };
};

describe("updateVideo controller", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 con errores de validación", async () => {
    const { req, res } = mockReqResNext();
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "Bad update" }]
    });

    await updateVideo(req, res);
    expect(errorResponse).toHaveBeenCalledWith(res, ["Bad update"], 400);
  });

  it("retorna 400 sin campos válidos", async () => {
    const { req, res } = mockReqResNext();
    validationResult.mockReturnValue({ isEmpty: () => true });
    await updateVideo(req, res);
    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "No valid fields provided",
      400
    );
  });

  it("retorna 404 si no existe el video", async () => {
    const { req, res } = mockReqResNext();
    validationResult.mockReturnValue({ isEmpty: () => true });
    Video.update.mockResolvedValue(null);

    req.body.views = "5";
    await updateVideo(req, res);

    expect(Video.update).toHaveBeenCalledWith("vid123", "user123", {
      views: 5
    });
    expect(errorResponse).toHaveBeenCalledWith(res, "Video not found", 404);
  });

  it("actualiza y retorna el video correctamente", async () => {
    const { req, res } = mockReqResNext();
    validationResult.mockReturnValue({ isEmpty: () => true });
    const updatedVideo = { id: "vid123", views: 20 };
    Video.update.mockResolvedValue(updatedVideo);

    req.body.views = "20";
    req.file = { filename: "newthumb.png" };

    await updateVideo(req, res);

    expect(Video.update).toHaveBeenCalledWith("vid123", "user123", {
      views: 20,
      thumbnail: "newthumb.png"
    });
    expect(successResponse).toHaveBeenCalledWith(res, updatedVideo);
  });

  it("maneja errores y retorna 500", async () => {
    const { req, res } = mockReqResNext();
    validationResult.mockReturnValue({ isEmpty: () => true });
    Video.update.mockRejectedValue(new Error("DB fail"));

    req.body.views = "15";
    await updateVideo(req, res);

    expect(errorResponse).toHaveBeenCalledWith(res, "DB fail");
  });
});
