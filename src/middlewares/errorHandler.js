const errorHandler = function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    title: 'Internal Server Error',
    detail: err.message,
    instance: req.originalUrl,
    status: 500
  });
};

module.exports = errorHandler;
