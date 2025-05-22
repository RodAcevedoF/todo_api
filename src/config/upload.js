import multer from "multer";

const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationError =
      "Invalid file type. Only PNG, JPEG, JPG and WEBP are allowed.";
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

export default upload;
