const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculatePriceLogic } = require('./priceCalculator');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

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
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Amount is required and should be a number.' });
    }

    // Create a Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // The amount should be in the smallest currency unit (e.g., cents)
      currency: 'usd', // Specify your currency
      payment_method_types: ['card'],
    });
    console.log('Payment Intent:', paymentIntent);

    // Respond with the client secret for the frontend
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating Payment Intent:', error);
    res.status(500).json({ message: 'Error creating Payment Intent', error: error.message });
  }
};
// Create a Checkout Session with Stripe
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount } = req.body; // Only expecting `amount` from the request body
    console.log('Request Body:', req.body);

    // Validate the amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Amount is required and should be a number.' });
    }

    // Create a Checkout Session with Stripe
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Ride Payment' },
            unit_amount: amount, // Use the provided amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      redirect_on_completion: 'never',
      
    });

    // Return the session ID to the frontend
    console.log('Checkout Session:', session);
    res.status(200).json({ sessionId: session.id, clientSecret: session.client_secret });
  } catch (error) {
    console.error('Error creating Checkout Session:', error);
    res.status(500).json({ message: 'Error creating Checkout Session', error: error.message });
  }
};
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.query;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('session', session);
    console.log('Payment Status:', session.payment_status);

    res.status(200).json({ paymentStatus: session.payment_status });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ message: 'Error checking payment status', error: error.message });
  }
};


