import upload from "../config/upload.js";
import multer from "multer";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const uploadMiddleware = async (req, res, next) => {
  const uploader = upload.single("file");

  uploader(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ error: `Upload error: ${err.message}` });
    }

    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }

    if (!req.file) {
      req.fileUrl = null;
      return next();
    }

    try {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "profile-pictures"
      );
      req.fileUrl = result.secure_url;
      req.filePublicId = result.public_id;
      next();
    } catch (uploadError) {
      return res
        .status(500)
        .json({ error: `Cloudinary error: ${uploadError.message}` });
    }
  });
};
