export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "The requested page or service was not found.",
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  let message = err.message || "Internal Server Error";

  // Never expose internal/service errors (email, Razorpay, DB, etc.) to clients.
  if (statusCode >= 500 || !err.isOperational) {
    message = "Something went wrong on our end. Please try again.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
