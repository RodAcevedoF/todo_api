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

import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import { createVideo, getVideos, deleteVideo, updateVideo } from "../controllers/video.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  [
    check("videoId").notEmpty().withMessage("Video ID is required"),
    check("title").notEmpty().withMessage("Title is required"),
    check("channel").notEmpty().withMessage("Channel is required"),
    check("notes").optional().isString().withMessage("Notes must be a string"),
    check("thumbnail").optional().isString().withMessage("Thumbnail must be a string")
  ],
  createVideo
);

router.get("/", getVideos);

router.delete("/:id", deleteVideo);

router.put(
  "/:id",
  [
    check("videoId").notEmpty().withMessage("Video ID is required"),
    check("title").notEmpty().withMessage("Title is required"),
    check("channel").notEmpty().withMessage("Channel is required"),
    check("notes").optional().isString().withMessage("Notes must be a string"),
    check("thumbnail").optional().isString().withMessage("Thumbnail must be a string")
  ],
  updateVideo
);

export default router;
