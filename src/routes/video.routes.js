/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Endpoints for managing videos
 *
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Create a new video entry
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoId
 *               - title
 *               - channel
 *             properties:
 *               videoId:
 *                 type: string
 *                 example: "abc123"
 *               title:
 *                 type: string
 *                 example: "Video Title"
 *               channel:
 *                 type: string
 *                 example: "Channel Name"
 *               notes:
 *                 type: string
 *                 example: "Some notes about the video"
 *               thumbnail:
 *                 type: string
 *                 example: "http://example.com/thumbnail.jpg"
 *     responses:
 *       201:
 *         description: Video created successfully
 *       400:
 *         description: Invalid input
 *
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Retrieve videos for the authenticated user
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of videos to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of videos to skip
 *     responses:
 *       200:
 *         description: List of videos retrieved successfully
 *
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete a video entry
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found or unauthorized
 *
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Update a video entry
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoId:
 *                 type: string
 *               title:
 *                 type: string
 *               channel:
 *                 type: string
 *               notes:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Video not found
 */
// src/routes/video.routes.js

import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import {
  createVideo,
  getVideos,
  deleteVideo,
  updateVideo
} from "../controllers/video.controller.js";
import upload from "../config/upload.js";

const router = Router();

// Middleware para excluir 'videoId' si se envía en la solicitud
const excludeVideoId = (req, res, next) => {
  if (req.body.videoId) {
    delete req.body.videoId;
  }
  next();
};

router.use(authenticate);

// Ruta para crear un video (maneja archivos si es necesario)
router.post(
  "/",
  upload.single("thumbnail"), // Si manejas archivos al crear un video
  [
    check("videoId").notEmpty().withMessage("El ID del video es obligatorio"),
    check("title").notEmpty().withMessage("El título es obligatorio"),
    check("channel").notEmpty().withMessage("El canal es obligatorio"),
    check("notes").optional().isString().withMessage("Las notas deben ser texto")
    // No validamos 'thumbnail' aquí; se maneja con multer
  ],
  createVideo
);

router.get("/", getVideos);

router.delete("/:id", deleteVideo);

// Ruta para actualizar un video (permite actualizaciones parciales)
router.patch(
  "/:id",
  upload.single("thumbnail"), // Aplica el middleware de multer si manejas archivos
  excludeVideoId, // Middleware para excluir 'videoId' del req.body
  [
    check("title").optional().isString().withMessage("El título debe ser texto"),
    check("channel").optional().isString().withMessage("El canal debe ser texto"),
    check("notes").optional().isString().withMessage("Las notas deben ser texto")
    // No validamos 'thumbnail' aquí; se maneja con multer
  ],
  updateVideo
);

export default router;
