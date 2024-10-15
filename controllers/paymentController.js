const { Payment, Trip } = require('../models');
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

    const payment = await Payment.create({
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
    const payments = await Payment.findAll({
      include: { model: Trip }
    });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get a payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: { model: Trip }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};