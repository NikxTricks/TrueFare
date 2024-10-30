// controllers/paymentController.js

const paymentService = require('../services/paymentService');
const tripService = require('../services/tripService');
const { calculatePriceLogic } = require('./priceCalculator');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { tripID, method, pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng } = req.body;

    if (!tripID || !method) {
      return res.status(400).json({ message: 'tripID and method are required.' });
    }

    if (
      !pickupLat || isNaN(pickupLat) ||
      !pickupLng || isNaN(pickupLng) ||
      !dropoffLat || isNaN(dropoffLat) ||
      !dropoffLng || isNaN(dropoffLng) ||
      !driverLat || isNaN(driverLat) ||
      !driverLng || isNaN(driverLng)
    ) {
      return res.status(400).json({ message: 'Invalid or missing coordinates' });
    }

    const { price } = calculatePriceLogic(
      parseFloat(pickupLat), parseFloat(pickupLng),
      parseFloat(dropoffLat), parseFloat(dropoffLng),
      parseFloat(driverLat), parseFloat(driverLng)
    );

    // Optionally, you might want to update the trip status here
    await tripService.updateTrip(parseInt(tripID), { status: 'completed' });

    const payment = await paymentService.createPayment({
      tripID,
      method,
      amount: price
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(parseInt(req.params.id));

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};