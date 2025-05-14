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
