import upload from "../config/upload.js";
import multer from "multer";

export const uploadMiddleware = (req, res, next) => {
  const uploader = upload.single("file");

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Error específico de Multer (por ejemplo, tamaño de archivo excedido)
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      // Otro tipo de error, por ejemplo, del sistema de archivos
      return res.status(500).json({ error: `Upload error: ${err.message}` });
    }

    if (req.fileValidationError) {
      // Error de tipo de archivo personalizado
      return res.status(400).json({ error: req.fileValidationError });
    }

    if (!req.file) {
      // Si no se cargó archivo (pero no hubo error)
      return res
        .status(400)
        .json({ error: "No file uploaded or invalid file type" });
    }

    next(); // Todo correcto, continuar con el flujo
  });
};
