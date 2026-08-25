function notFoundHandler (req, res, next) {
  const error = new Error(`Route ${req.originalUrl} not found`)
  error.status = 404
  next(error)
}

function errorHandler (err, req, res, _next) {
  const status = err.status || 500
  const payload = {
    success: false,
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  }
  res.status(status).json(payload)
}

module.exports = {
  notFoundHandler,
  errorHandler
}
