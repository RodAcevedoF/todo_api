import { validationResult } from 'express-validator';
import Video from '../models/Video.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const createVideo = async (req, res) => {
  // Manejo de validaciones
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array().map(err => err.msg), 400);
  }

  try {
    const video = await Video.create(req.user.id, req.body);
    successResponse(res, video, 201);
  } catch (error) {
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

