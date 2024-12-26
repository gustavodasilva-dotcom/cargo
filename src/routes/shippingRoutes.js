const {
  createShippingOrderSchema
} = require('../validators/shippingValidator');
const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const validateRequest = require('../middlewares/validateRequest');

router.get('/get-all', shippingController.handleGetAllShippingOrders);

router.get('/get-by-id/:id', shippingController.handleGetShippingOrderById);

router.post(
  '/create',
  validateRequest(createShippingOrderSchema),
  shippingController.handleCreateShippingOrder
);

router.delete('/delete/:id', shippingController.handleDeleteShippingOrder);

module.exports = router;
