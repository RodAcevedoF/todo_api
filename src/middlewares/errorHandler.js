export const errorHandler = (err, req, res, next) => {
  // Mostrar el stack trace en la consola para propósitos de debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Manejo específico de errores JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired. Please log in again.'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.'
    });
  }

  // Manejo de errores Multer (archivos)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Manejo genérico de errores
  const statusCode = err.status || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Solo incluir el stack trace en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
