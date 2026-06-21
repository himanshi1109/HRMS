const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log the full error to the console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error occurred:', err);
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
