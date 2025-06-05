import { Router } from "express";
import upload from "../config/upload.js";
import { authenticate } from "../middlewares/auth.js";
import { requireVerifiedUser } from "../middlewares/requireVerifiedUser.js";
import {
  createVideo,
  getVideos,
  deleteVideo,
  updateVideo
} from "../controllers/video.controller.js";
import {
  createVideoValidator,
  updateVideoValidator
} from "../middlewares/videoValidators.js";

const router = Router();

const excludeVideoId = (req, res, next) => {
  if (req.body.videoId) delete req.body.videoId;
  next();
};

router.use(authenticate);
router.use(requireVerifiedUser);

router.post("/", upload.single("thumbnail"), createVideoValidator, createVideo);
router.get("/", getVideos);
router.delete("/:id", deleteVideo);
router.patch(
  "/:id",
  upload.single("thumbnail"),
  excludeVideoId,
  updateVideoValidator,
  updateVideo
);

export default router;
