const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');

router.get('/', measurementController.handleGetAll);

module.exports = router;
