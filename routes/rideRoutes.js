const express = require('express');
const router = express.Router();
const rideSenderController = require('../controllers/rideSender');

router.post('/sendRide', rideSenderController.sendRide);

module.exports = router;
