const Joi = require('joi');
const { SHIPPING_PARTIES } = require('../enums/shippingParties');

const shippingItemsSchema = Joi.object()
  .keys({
    title: Joi.string().required().min(1).max(255),
    barcode: Joi.string().required().min(8).max(48),
    quantity: Joi.number().required(),
    measurement_id: Joi.string().uuid().required()
  })
  .options({ abortEarly: false });

const shippingPartiesSchema = Joi.object()
  .keys({
    type: Joi.number()
      .required()
      .valid(...Object.values(SHIPPING_PARTIES)),
    name: Joi.string().required().min(1).max(255),
    email: Joi.string().email().required().min(3).max(320),
    cellphone: Joi.string().required().max(3).max(15),
    address: Joi.string().required().max(1).max(255)
  })
  .options({ abortEarly: false });

const createShippingOrderSchema = Joi.object({
  senders: Joi.array()
    .items(
      shippingPartiesSchema.custom((value, helpers) => {
        if (value.type !== SHIPPING_PARTIES.SENDER) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    )
    .required()
    .min(1)
    .messages({
      'array.min': '\"senders\" must contain at least one item', // eslint-disable-line no-useless-escape
      'any.invalid': '\"senders\" must contain just sender objects' // eslint-disable-line no-useless-escape
    }),
  recipients: Joi.array()
    .items(
      shippingPartiesSchema.custom((value, helpers) => {
        if (value.type !== SHIPPING_PARTIES.RECIPIENT) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    )
    .required()
    .min(1)
    .messages({
      'array.min': '\"recipients\" must contain at least one item', // eslint-disable-line no-useless-escape
      'any.invalid': '\"recipients\" must contain just recipient objects' // eslint-disable-line no-useless-escape
    }),
  items: Joi.array().items(shippingItemsSchema).required().min(1).messages({
    'array.min': '\"items\" must contain at least one item' // eslint-disable-line no-useless-escape
  })
}).options({ abortEarly: false });

module.exports = { createShippingOrderSchema };
