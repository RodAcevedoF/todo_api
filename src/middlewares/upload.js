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

    // Si no se subió un archivo, no lanzamos error y continuamos
    if (!req.file) {
      // Si no hay archivo, simplemente asignamos un valor nulo a req.file
      req.file = null;
    }

    next(); // Todo correcto, continuar con el flujo
  });
};
