const errorLogger = function (err, _req, _res, next) {
  console.error(err.stack);
  next(err);
};

module.exports = errorLogger;
