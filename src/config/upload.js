import multer from "multer";

const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];

const storage = multer.memoryStorage(); // CAMBIO ACÁ

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationError =
      "Invalid file type. Only PNG, JPEG, and PDF are allowed.";
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export default upload;
