const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const priceCalculatorController = require('../controllers/priceCalculator');

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);

module.exports = router;