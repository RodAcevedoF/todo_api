import multer from "multer";
import { v4 as uuid } from "uuid";
import fs from "fs/promises";

const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadDir = process.env.UPLOAD_DIR || "uploads"; // Carpeta base de subida
      await fs.mkdir(uploadDir, { recursive: true }); // Crear directorio si no existe
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null); // Error manejado
    }
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop().toLowerCase(); // Extrae la extensión
    const uniqueName = `${uuid()}.${ext}`; // Nombre único basado en UUID
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Registra el error en `req.fileValidationError` para el middleware
    req.fileValidationError =
      "Invalid file type. Only PNG, JPEG, and PDF are allowed.";
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo: 5 MB
  fileFilter
});

export default upload;
