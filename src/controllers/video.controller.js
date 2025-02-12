import { validationResult } from "express-validator";
import Video from "../models/Video.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createVideo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
      thumbnail: thumbnail || null
    });
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

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await Video.delete(req.user.id, id);
    if (!deletedVideo) {
      return errorResponse(res, "Video no encontrado o no autorizado", 404);
    }
    successResponse(res, null, 204);
  } catch (error) {
    errorResponse(res, error.message);
  }
}

export const updateVideo = async (req, res) => {
  try {
    console.log('Datos recibidos en req.body:', req.body);
    console.log('Archivo recibido:', req.file);

    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(
        res,
        errors.array().map((err) => err.msg),
        400
      );
    }

    // Crear 'videoData' a partir de 'req.body'
    const videoData = { ...req.body };

    // Excluir 'videoId' para evitar que sea modificado
    if (videoData.videoId) {
      delete videoData.videoId;
    }

    // Si recibiste un archivo, actualiza 'thumbnail'
    if (req.file) {
      videoData.thumbnail = req.file.filename;
    }

    // Verificar que 'videoData' no esté vacío
    if (Object.keys(videoData).length === 0) {
      return errorResponse(res, "No hay campos válidos para actualizar", 400);
    }

    // Actualizar el video
    const video = await Video.update(req.params.id, req.user.id, videoData);

    if (!video) {
      return errorResponse(res, "Video no encontrado", 404);
    }

    successResponse(res, video);
  } catch (error) {
    console.error('Error al actualizar el video:', error);
    errorResponse(res, error.message);
  }
};