const requestLogger = function (req, _, next) {
  console.log(`[server] ${req.method} ${req.path}`);
  next();
};

module.exports = requestLogger;
