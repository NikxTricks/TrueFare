const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');

router.get('/closestDriver', rideController.getClosestDriver);

module.exports = router;
