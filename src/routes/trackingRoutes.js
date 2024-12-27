const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

router.get(
  '/events/:tracking_code',
  trackingController.handleGetShippingOrderTracking
);

module.exports = router;
