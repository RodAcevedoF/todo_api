import { validationResult } from "express-validator";
import Video from "../models/Video.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createVideo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors", errors.array());
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const { thumbnail, ...videoData } = req.body;

    const video = await Video.create(req.user.id, {
      ...videoData,
      thumbnail: req.file ? req.file.filename : thumbnail || null
    });

    successResponse(res, video, 201);
  } catch (error) {
    console.error("createVideo error:", error);
    errorResponse(res, error.message);
  }
};

export const getVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const videos = await Video.findByUser(req.user.id, limit, offset);
    successResponse(res, videos);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await Video.delete(req.user.id, id);
    if (!deletedVideo) {
      return errorResponse(res, "video not found or unauthorized", 404);
    }
    successResponse(res, null, 204);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const updateVideo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(
        res,
        errors.array().map((err) => err.msg),
        400
      );
    }

    const videoData = { ...req.body };

    if (req.file) {
      videoData.thumbnail = req.file.filename;
    }

    if (videoData.videoId) {
      delete videoData.videoId;
    }

    if (Object.keys(videoData).length === 0) {
      return errorResponse(res, "valid fields not found", 400);
    }

    const video = await Video.update(req.params.id, req.user.id, videoData);

    if (!video) {
      return errorResponse(res, "Video not found", 404);
    }

    successResponse(res, video);
  } catch (error) {
    console.error("error on video update:", error);
    errorResponse(res, error.message);
  }
};
