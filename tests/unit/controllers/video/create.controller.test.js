import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../../src/models/Video.js", () => ({
  default: {
    findByUser: jest.fn()
  }
}));

jest.unstable_mockModule("../../../../src/utils/apiResponse.js", () => ({
  successResponse: jest.fn(),
  errorResponse: jest.fn()
}));

const { getVideos } = await import(
  "../../../../src/controllers/video.controller.js"
);
const Video = (await import("../../../../src/models/Video.js")).default;
const { successResponse, errorResponse } = await import(
  "../../../../src/utils/apiResponse.js"
);

describe("getVideos", () => {
  const mockRes = () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { status, json };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería devolver una lista de videos", async () => {
    const req = {
      query: { limit: "5", offset: "0" },
      user: { id: "user-123" }
    };
    const res = mockRes();
    const videos = [{ id: 1 }, { id: 2 }];
    Video.findByUser.mockResolvedValue(videos);

    await getVideos(req, res);

    expect(Video.findByUser).toHaveBeenCalledWith("user-123", 5, 0);
    expect(successResponse).toHaveBeenCalledWith(res, videos);
  });

  it("debería manejar errores de forma correcta", async () => {
    const req = { query: {}, user: { id: "user-123" } };
    const res = mockRes();
    const errorMsg = "DB failed";

    Video.findByUser.mockRejectedValue(new Error(errorMsg));

    await getVideos(req, res);

    expect(errorResponse).toHaveBeenCalledWith(res, errorMsg);
  });
});
