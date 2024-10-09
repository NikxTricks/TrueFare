const express = require('express');
const router = express.Router();
const priceCalculatorController = require('../controllers/priceCalculator');  // Correct import for price calculation

router.get('/calculatePrice', priceCalculatorController.calculatePrice);  // Route for calculating price

module.exports = router;
