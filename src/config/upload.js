import multer from "multer";
import { v4 as uuid } from "uuid";

const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || "uploads"); 
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop().toLowerCase();
    const uniqueName = `${uuid()}.${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); 
  } else {
    cb(
      new Error("Invalid file type. Only PNG, JPEG, and PDF are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export default upload;
