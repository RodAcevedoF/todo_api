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


import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import { createVideo, getVideos, deleteVideo } from "../controllers/video.controller.js";

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

export default router;
