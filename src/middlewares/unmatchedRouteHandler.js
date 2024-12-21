const unmatchedRouteHandler = function (req, res) {
  res.status(400).json({
    title: 'Bad request',
    detail: 'The requested route is inaccessible or does not exist.',
    instance: req.originalUrl,
    status: 400
  });
};

module.exports = unmatchedRouteHandler;
