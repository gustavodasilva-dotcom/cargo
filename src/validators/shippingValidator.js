const Joi = require('joi');

const shippingItems = Joi.object()
  .keys({
    title: Joi.string().required().min(1).max(255),
    barcode: Joi.string().required().min(8).max(48),
    quantity: Joi.number().required(),
    measurement_id: Joi.string().uuid().required()
  })
  .options({ abortEarly: false });

const createShippingOrderSchema = Joi.object({
  items: Joi.array()
    .items(shippingItems)
    .required()
    .min(1)
    .messages({
      'array.min': '\"items\" must contain at least one item' // eslint-disable-line no-useless-escape
    })
    .options({ abortEarly: false })
});

module.exports = { createShippingOrderSchema };
