import { check } from "express-validator";

export const createVideoValidator = [
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
];

export const updateVideoValidator = [
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
];
