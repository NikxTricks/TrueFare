const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');

router.get('/closestDriver', rideController.getClosestDriver);

router.post('/payment', rideController.processPayment);  // For processing payment

router.post('/notifyDriver', rideController.sendNotificationToDriver);  // To notify driver of ride

router.post('/acceptRider', rideController.acceptRider);  // endpoint for accepting driver

module.exports = router;
