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
    check("video_id").notEmpty().withMessage("Video ID required"),
    check("title").notEmpty().withMessage("Video title is required"),
    check("channel").notEmpty().withMessage("Channel is required"),
    check("channelId")
      .optional()
      .isString()
      .withMessage("Channel ID must be text"),
    check("notes").optional().isString().withMessage("Notes must be text"),
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be text"),
    check("created_at")
      .optional()
      .isISO8601()
      .withMessage("Creation date must be ISO8601 format"),
    check("views")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Views must be a positive number"),
    check("duration_seconds")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Duration must be a positive number"),
    check("checked")
      .optional()
      .isBoolean()
      .withMessage("Field 'checked' must be a boolean")
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
    check("title").optional().isString().withMessage("Title must be text"),
    check("channel")
      .optional()
      .isString()
      .withMessage("Channel field must be text"),
    check("channelId")
      .optional()
      .isString()
      .withMessage("Channel ID must be text"),
    check("notes").optional().isString().withMessage("Notes must be text"),
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be text"),
    check("created_at")
      .optional()
      .isISO8601()
      .withMessage("Creation date must be ISO8601 format"),
    check("views")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Views must be a positive number"),
    check("duration_seconds")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Duration must be a positive number"),
    check("checked")
      .optional()
      .isBoolean()
      .withMessage("Field 'checked' must be a boolean")
  ],
  updateVideo
);

export default router;
/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       required:
 *         - video_id
 *         - title
 *         - channel
 *       properties:
 *         video_id:
 *           type: string
 *           description: Video ID
 *         title:
 *           type: string
 *           description: Video title
 *         channel:
 *           type: string
 *           description: Video channel name
 *         channelId:
 *           type: string
 *           description: ID of the channel
 *         notes:
 *           type: string
 *           description: Video notes
 *         description:
 *           type: string
 *           description: Video description
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         views:
 *           type: integer
 *           description: Number of views
 *         duration_seconds:
 *           type: integer
 *           description: Duration in seconds
 *         checked:
 *           type: boolean
 *           description: Video checked status
 */

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Operations related to videos
 */

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Create a new video
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       201:
 *         description: Video created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: List of videos
 */

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Video ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 */

/**
 * @swagger
 * /videos/{id}:
 *   patch:
 *     summary: Update a video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Video ID to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       404:
 *         description: Video not found
 *       400:
 *         description: Invalid input
 */
