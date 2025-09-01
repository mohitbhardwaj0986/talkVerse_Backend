const erroHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: err.success || false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    data: err.data || null,
    data: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default erroHandler;
