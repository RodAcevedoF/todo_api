import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createVideo,
  getVideos,
  deleteVideo,
  updateVideo
} from "../../../src/controllers/video.controller";

import Video from "../../../src/models/Video";
import { validationResult } from "express-validator";

vi.mock("../../../src/models/Video");
vi.mock("express-validator", () => ({
  validationResult: vi.fn()
}));

describe("createVideo", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        video_id: "abc123",
        title: "Test video",
        views: "100",
        duration_seconds: "60",
        checked: "true",
        channelId: "channel-xyz"
      },
      file: { filename: "thumb.jpg" },
      user: { id: 1 }
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if video_id is missing", async () => {
    req.body.video_id = "";

    await createVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "ID field is required"
    });
  });

  it("should return 400 if validation fails", async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "Title is required" }, { msg: "Invalid duration" }]
    });

    await createVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Title is required; Invalid duration"
    });
  });

  it("should create a video and return 201", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const mockVideo = { id: 1, title: "Created video" };
    Video.create.mockResolvedValue(mockVideo);

    await createVideo(req, res);

    expect(Video.create).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        video_id: "abc123",
        views: 100,
        duration_seconds: 60,
        checked: true,
        thumbnail: "thumb.jpg"
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockVideo
    });
  });

  it("should return 500 if creation throws error", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    Video.create.mockRejectedValue(new Error("DB error"));

    await createVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "DB error"
    });
  });
});

describe("getVideos", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      user: { id: 1 }
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return videos for user", async () => {
    const videos = [{ id: 1, title: "Video 1" }];
    Video.findByUser.mockResolvedValue(videos);

    await getVideos(req, res);

    expect(Video.findByUser).toHaveBeenCalledWith(1, 10, 0);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: videos
    });
  });

  it("should return 500 if fetch fails", async () => {
    Video.findByUser.mockRejectedValue(new Error("DB error"));

    await getVideos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "DB error"
    });
  });
});

describe("deleteVideo", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: "123" },
      user: { id: 1 }
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 204 if video deleted", async () => {
    Video.delete.mockResolvedValue(true);

    await deleteVideo(req, res);

    expect(Video.delete).toHaveBeenCalledWith("123", 1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: null
    });
  });

  it("should return 404 if not found", async () => {
    Video.delete.mockResolvedValue(false);

    await deleteVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Video not found or unauthorized"
    });
  });

  it("should return 500 on error", async () => {
    Video.delete.mockRejectedValue(new Error("Error"));

    await deleteVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error"
    });
  });
});
describe("updateVideo", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { title: "Updated Title", views: "300" },
      params: { id: "abc" },
      user: { id: 1 },
      file: undefined
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "Invalid data" }]
    });

    await updateVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: ["Invalid data"]
    });
  });

  it("should return 400 if no valid fields provided", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    req.body = {}; // no actual fields

    await updateVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No valid fields provided"
    });
  });

  it("should return 404 if video not found", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    req.body = { title: "Updated" };
    Video.update.mockResolvedValue(null);

    await updateVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Video not found"
    });
  });

  it("should update and return video", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const updated = { id: 1, title: "Updated" };
    Video.update.mockResolvedValue(updated);

    await updateVideo(req, res);

    expect(Video.update).toHaveBeenCalledWith("abc", 1, expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: updated
    });
  });

  it("should return 500 if update fails", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    Video.update.mockRejectedValue(new Error("Update error"));

    await updateVideo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Update error"
    });
  });
});
