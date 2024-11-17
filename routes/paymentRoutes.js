const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const priceCalculatorController = require('../controllers/priceCalculator');

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/check-payment-status', paymentController.checkPaymentStatus);
router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/create-checkout-session', paymentController.createCheckoutSession);

module.exports = router;