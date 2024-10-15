const Payment = require('../models/payment');
const { calculatePriceLogic } = require('./priceCalculator');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { tripID, method, pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng } = req.body;

    // Validate required fields
    if (!tripID || !method) {
      return res.status(400).json({ message: 'tripID and method are required.' });
    }

    // Validate coordinates
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

    // Calculate the amount using the price calculator
    const { price } = calculatePriceLogic(
      parseFloat(pickupLat), parseFloat(pickupLng),
      parseFloat(dropoffLat), parseFloat(dropoffLng),
      parseFloat(driverLat), parseFloat(driverLng)
    );

    // Create and save the payment
    const payment = new Payment({ tripID, method, amount: price });
    await payment.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};
// Get all payments
exports.getAllPayments = async (req, res) => {
    try {
      const payments = await Payment.find().populate('tripID');
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
  };
  
  // Get a payment by ID
  exports.getPaymentById = async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id).populate('tripID');
  
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
  
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching payment', error: error.message });
    }
  };