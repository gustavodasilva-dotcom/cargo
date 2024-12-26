const { formatJoiErrors } = require('../utils/validationUtils');

const validateRequest =
  (schema, propertyName = 'body') =>
  (req, res, next) => {
    const { error } = schema.validate(req[propertyName]);
    if (error) {
      return res.status(400).json({
        title: 'Bad Request',
        detail: 'The request object is not valid.',
        instance: req.originalUrl,
        status: 400,
        'invalid-params': formatJoiErrors(error)
      });
    }
    next();
  };

module.exports = validateRequest;
