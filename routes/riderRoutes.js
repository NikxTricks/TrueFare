const express = require('express');
const router = express.Router();
const priceCalculatorController = require('../controllers/priceCalculator');  // Correct import for price calculation
const rideController = require('../controllers/rideController');

router.get('/calculatePrice', priceCalculatorController.calculatePrice);  // Route for calculating price
router.get('/closestDriver', rideController.getClosestDriver);
router.post('/payment', rideController.processPayment);
router.post('/notifyDriver', rideController.sendNotificationToDriver);
router.post('/acceptRider', rideController.acceptRider);
router.post('/assignDriver', rideController.assignClosestDriver);
router.post('/createDriver', rideController.createDriver);

module.exports = router;
