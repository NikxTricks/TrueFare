const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

router.put('/updateLocation', driverController.updateLocation);

module.exports = router;
