import { validationResult } from "express-validator";
import Video from "../models/Video.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createVideo = async (req, res) => {
  // Verifica que `video_id` esté presente
  if (!req.body.video_id || req.body.video_id.trim() === "") {
    return errorResponse(res, "El campo video_id es obligatorio.", 400);
  }

  if (
    (!req.body.channelId || req.body.channelId === "") &&
    req.body.channelid
  ) {
    req.body.channelId = req.body.channelid;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const { thumbnail, description, created_at, ...videoData } = req.body;

    const video = await Video.create(req.user.id, {
      video_id: req.body.video_id,
      ...videoData,
      views: parseInt(req.body.views) || 0,
      duration_seconds: parseInt(req.body.duration_seconds) || 0,
      checked: req.body.checked === "true" || req.body.checked === true,
      description: description || null,
      created_at: created_at ? new Date(created_at) : new Date(),
      thumbnail: req.file ? req.file.filename : thumbnail || null
    });

    return successResponse(res, video, 201);
  } catch (error) {
    console.error("Error creando el video:", error);
    return errorResponse(res, error.message);
  }
};

export const getVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const videos = await Video.findByUser(req.user.id, limit, offset);
    return successResponse(res, videos);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const deleted = await Video.delete(req.params.id, req.user.id);
    if (!deleted)
      return errorResponse(res, "Video not found or unauthorized", 404);
    return successResponse(res, null, 204);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateVideo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }
  try {
    const videoData = { ...req.body };
    if (req.file) {
      videoData.thumbnail = req.file.filename;
    }

    if (videoData.videoId) delete videoData.videoId;
    if (videoData.channelId) delete videoData.channelId;

    if (videoData.created_at) {
      videoData.created_at = new Date(videoData.created_at);
    }
    if (Object.keys(videoData).length === 0) {
      return errorResponse(res, "No valid fields provided", 400);
    }
    if ("views" in videoData) {
      videoData.views = parseInt(videoData.views) || 0;
    }
    if ("duration_seconds" in videoData) {
      videoData.duration_seconds = parseInt(videoData.duration_seconds) || 0;
    }
    if ("checked" in videoData) {
      videoData.checked =
        videoData.checked === "true" || videoData.checked === true;
    }

    const video = await Video.update(req.params.id, req.user.id, videoData);
    if (!video) return errorResponse(res, "Video not found", 404);
    return successResponse(res, video);
  } catch (error) {
    console.error("Error updating video:", error);
    return errorResponse(res, error.message);
  }
};
