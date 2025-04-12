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

const excludeVideoId = (req, res, next) => {
  if (req.body.videoId) delete req.body.videoId;
  next();
};

router.use(authenticate);

router.post(
  "/",
  upload.single("thumbnail"),
  [
    check("video_id").notEmpty().withMessage("El ID del video es obligatorio"),
    check("title").notEmpty().withMessage("El título es obligatorio"),
    check("channel").notEmpty().withMessage("El canal es obligatorio"),
    check("channelId")
      .optional()
      .isString()
      .withMessage("El ID del canal debe ser texto"),
    check("notes")
      .optional()
      .isString()
      .withMessage("Las notas deben ser texto"),
    check("description")
      .optional()
      .isString()
      .withMessage("La descripción debe ser texto"),
    check("created_at")
      .optional()
      .isISO8601()
      .withMessage("La fecha de creación debe ser válida en formato ISO8601")
  ],
  createVideo
);

router.get("/", getVideos);

router.delete("/:id", deleteVideo);

router.patch(
  "/:id",
  upload.single("thumbnail"),
  excludeVideoId,
  [
    check("title")
      .optional()
      .isString()
      .withMessage("El título debe ser texto"),
    check("channel")
      .optional()
      .isString()
      .withMessage("El canal debe ser texto"),
    check("channelId")
      .optional()
      .isString()
      .withMessage("El ID del canal debe ser texto"),
    check("notes")
      .optional()
      .isString()
      .withMessage("Las notas deben ser texto"),
    check("description")
      .optional()
      .isString()
      .withMessage("La descripción debe ser texto"),
    check("created_at")
      .optional()
      .isISO8601()
      .withMessage("La fecha de creación debe ser válida en formato ISO8601")
  ],
  updateVideo
);

export default router;

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Gestión de videos
 *
 * /api/videos:
 *   post:
 *     summary: Crear un nuevo video
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               videoId:
 *                 type: string
 *                 description: ID del video en YouTube.
 *               title:
 *                 type: string
 *                 description: Título del video.
 *               channel:
 *                 type: string
 *                 description: Nombre del canal del video.
 *               notes:
 *                 type: string
 *                 description: Notas sobre el video (opcional).
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Miniatura del video (archivo opcional).
 *     responses:
 *       201:
 *         description: Video creado exitosamente.
 *       400:
 *         description: Error en la validación de datos.
 *
 *   get:
 *     summary: Obtener todos los videos del usuario
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de videos obtenida correctamente.
 *       401:
 *         description: No autorizado.
 *
 * /api/videos/{id}:
 *   delete:
 *     summary: Eliminar un video por ID
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del video a eliminar.
 *     responses:
 *       204:
 *         description: Video eliminado exitosamente.
 *       404:
 *         description: Video no encontrado.
 *
 *   patch:
 *     summary: Actualizar un video por ID
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del video a actualizar.
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nuevo título del video.
 *               channel:
 *                 type: string
 *                 description: Nuevo nombre del canal.
 *               notes:
 *                 type: string
 *                 description: Nuevas notas sobre el video (opcional).
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Nueva miniatura del video (archivo opcional).
 *     responses:
 *       200:
 *         description: Video actualizado exitosamente.
 *       404:
 *         description: Video no encontrado.
 */
