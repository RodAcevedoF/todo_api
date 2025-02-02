/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary: Delete a video by ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found or not authorized
 */

/**
 * @swagger
 * /videos/{id}:
 *   put:
 *     summary: Update a video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The video ID
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
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       400:
 *         description: Validation error
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
    check("notes").optional().isString().withMessage("Notes must be a string")
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
    check("notes").optional().isString().withMessage("Notes must be a string")
  ],
  updateVideo
);

export default router;
