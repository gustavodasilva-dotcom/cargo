const errorLogger = function (err, _req, _res, next) {
  console.error("[server] An error ocurred:", err.stack);
  next(err);
};

module.exports = errorLogger;
