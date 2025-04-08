import { validationResult } from "express-validator";
import Video from "../models/Video.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createVideo = async (req, res) => {
  if (
    (!req.body.channelId || req.body.channelId === "") &&
    req.body.channelid
  ) {
    req.body.channelId = req.body.channelid;
  }

  console.log("Datos recibidos en createVideo:", req.body);
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
      ...videoData,
      description: description || null,
      created_at: created_at ? new Date(created_at) : new Date(),
      thumbnail: req.file ? req.file.filename : thumbnail || null
    });
    return successResponse(res, video, 201);
  } catch (error) {
    console.error("Error creating video:", error);
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
    // Evitar actualizar el videoId, ya que es un identificador inmutable.
    //if (videoData.videoId) delete videoData.videoId;
    // Opcional: Si no deseas que se actualice el channelId, puedes descomentar la siguiente línea.
    // if (videoData.channelId) delete videoData.channelId;

    if (videoData.created_at) {
      videoData.created_at = new Date(videoData.created_at);
    }
    if (Object.keys(videoData).length === 0) {
      return errorResponse(res, "No valid fields provided", 400);
    }
    const video = await Video.update(req.params.id, req.user.id, videoData);
    if (!video) return errorResponse(res, "Video not found", 404);
    return successResponse(res, video);
  } catch (error) {
    console.error("Error updating video:", error);
    return errorResponse(res, error.message);
  }
};
