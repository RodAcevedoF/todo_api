export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired. Please log in again."
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again."
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  const statusCode = err.status || 500;
  const response = {
    success: false,
    message: err.message || "Internal Server Error"
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
