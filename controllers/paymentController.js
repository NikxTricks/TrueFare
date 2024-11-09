const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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

    // Calculate price based on coordinates
    const { price } = calculatePriceLogic(
      parseFloat(pickupLat), parseFloat(pickupLng),
      parseFloat(dropoffLat), parseFloat(dropoffLng),
      parseFloat(driverLat), parseFloat(driverLng)
    );

    // Create the payment in Prisma
    const payment = await prisma.payment.create({
      data: {
        tripID,
        method,
        amount: price,
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        Trip: true, // Include related trip details
      },
    });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get a payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        Trip: true, // Include related trip details
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};
