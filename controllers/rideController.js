
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// mock the data for now 
let mockDrivers = [
  { driverID: 1, current_latitude: 37.7749, current_longitude: -122.4194, is_available: true },
  { driverID: 2, current_latitude: 37.7849, current_longitude: -122.4094, is_available: true },
  { driverID: 3, current_latitude: 37.7649, current_longitude: -122.4294, is_available: true }
];

exports.getClosestDriver = async (req, res) => {
  const { userLat, userLng } = req.query;

  try {
    const availableDrivers = mockDrivers.filter(driver => driver.is_available);
    const driverLocations = availableDrivers.map(driver => `${driver.current_latitude},${driver.current_longitude}`).join('|');

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
      params: {
        origins: `${userLat},${userLng}`,
        destinations: driverLocations,
        key: apiKey
      }
    });

    const distances = response.data.rows[0].elements;
    let minDistance = Infinity;
    let closestDriver = null;

    distances.forEach((distance, index) => {
      if (distance.status === 'OK' && distance.distance.value < minDistance) {
        minDistance = distance.distance.value;
        closestDriver = availableDrivers[index];
      }
    });

    if (!closestDriver) {
      return res.status(404).send('No available drivers found');
    }

    res.status(200).json({
      driverID: closestDriver.driverID,
      distance: minDistance
    });
  } catch (error) {
    res.status(500).send('Error finding the closest driver');
  }
};

// New method to handle payment via Stripe
exports.processPayment = async (req, res) => {
  const { amount, currency, paymentMethodId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirm: true,
    });

    res.status(200).send('Payment successful');
  } catch (error) {
    res.status(500).send('Error processing payment');
  }
};

//  method to send notification to the driver (e.g., using Firebase or Socket.io)
exports.sendNotificationToDriver = (req, res) => {
  const { driverID } = req.body;
  // Placeholder for notification logic
  // e.g., using Firebase Cloud Messaging or Socket.io to notify the driver in real-time
  res.status(200).send('Notification sent to driver');
};

//  method for accepting rider by driver
exports.acceptRider = async (req, res) => {
  const { rideID, driverID } = req.body;

  try {
    // Find the ride and update its driver and status
    let ride = mockRides.find(r => r.rideID === rideID);
    if (!ride) {
      return res.status(404).send('Ride not found');
    }

    if (ride.status !== 'pending') {
      return res.status(400).send('Ride is no longer available');
    }

    ride.driverID = driverID;
    ride.status = 'accepted';  // Update status to accepted

    res.status(200).send('Ride accepted successfully');
  } catch (error) {
    res.status(500).send('Error accepting the ride');
  }
};
