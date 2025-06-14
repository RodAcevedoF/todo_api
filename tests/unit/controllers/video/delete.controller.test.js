import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../../src/models/Video.js", () => ({
  default: { delete: jest.fn() }
}));
jest.unstable_mockModule("../../../../src/utils/apiResponse.js", () => ({
  successResponse: jest.fn((res, data, code = 200) =>
    res.status(code).json({ success: true, data })
  ),
  errorResponse: jest.fn((res, message, code = 500) =>
    res.status(code).json({ success: false, error: message })
  )
}));

const { default: Video } = await import("../../../../src/models/Video.js");
const { successResponse, errorResponse } = await import(
  "../../../../src/utils/apiResponse.js"
);
const { deleteVideo } = await import(
  "../../../../src/controllers/video.controller.js"
);

const mockRes = () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json };
};

describe("deleteVideo controller", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 404 si no se elimina nada", async () => {
    const req = { params: { id: "vid1" }, user: { id: "u1" } };
    const res = mockRes();

    Video.delete.mockResolvedValue(0);
    await deleteVideo(req, res);
    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Video not found or unauthorized",
      404
    );
  });

  it("elimina y retorna 204 si es exitoso", async () => {
    const req = { params: { id: "vid2" }, user: { id: "u2" } };
    const res = mockRes();

    Video.delete.mockResolvedValue(1);
    await deleteVideo(req, res);
    expect(successResponse).toHaveBeenCalledWith(res, null, 204);
  });

  it("maneja excepción y retorna 500", async () => {
    const req = { params: { id: "vid3" }, user: { id: "u3" } };
    const res = mockRes();

    Video.delete.mockRejectedValue(new Error("DB error"));
    await deleteVideo(req, res);
    expect(errorResponse).toHaveBeenCalledWith(res, "DB error");
  });
});
