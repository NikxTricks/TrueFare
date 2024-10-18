const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  // Assuming Stripe is used for payments
const io = require('../socket').getIO();  // Import Socket.io instance from socket.js

// Mock data for drivers and rides
let mockDrivers = [
  { driverID: 1, current_latitude: 37.7749, current_longitude: -122.4194, is_available: true },
  { driverID: 2, current_latitude: 37.7849, current_longitude: -122.4094, is_available: true },
  { driverID: 3, current_latitude: 37.7649, current_longitude: -122.4294, is_available: true }
];

let mockRides = [];

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = value => (value * Math.PI) / 180;
  const R = 6371;  // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;  // Distance in km
}

// Find the closest driver for the given user location
exports.getClosestDriver = async (req, res) => {
  const { userLat, userLng } = req.query;

  try {
    const availableDrivers = mockDrivers.filter(driver => driver.is_available);

    if (availableDrivers.length === 0) {
      return res.status(404).send('No available drivers found');
    }

    let minDistance = Infinity;
    let closestDriver = null;

    availableDrivers.forEach(driver => {
      const driverDistance = calculateDistance(
        userLat,
        userLng,
        driver.current_latitude,
        driver.current_longitude
      );

      if (driverDistance < minDistance) {
        minDistance = driverDistance;
        closestDriver = driver;
      }
    });

    if (!closestDriver) {
      return res.status(404).send('No nearby drivers found');
    }

    res.status(200).json({
      driverID: closestDriver.driverID,
      distance: minDistance.toFixed(2) + ' km'
    });
  } catch (error) {
    res.status(500).send('Error finding the closest driver');
  }
};

// Process payment via Stripe
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

// Send real-time notification to the driver
exports.sendNotificationToDriver = (req, res) => {
  const { driverID } = req.body;
  
  // Notify the driver via WebSocket
  io.to(`driver_${driverID}`).emit('rideAssigned', { message: 'New ride assigned to you' });

  res.status(200).send('Notification sent to driver');
};

// Accept a rider by the driver
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

    // Send real-time notification to driver about acceptance
    io.to(`driver_${driverID}`).emit('rideAccepted', { rideID, message: 'You have accepted the ride' });

    res.status(200).send('Ride accepted successfully');
  } catch (error) {
    res.status(500).send('Error accepting the ride');
  }
};

// Assign the closest driver to the ride
exports.assignClosestDriver = (req, res) => {
  const { pickupLat, pickupLng, distance, pickupLocation, dropoffLocation, price } = req.body;

  try {
    console.log('Received ride assignment request:', req.body);

    const availableDrivers = mockDrivers.filter(d => d.is_available);
    if (availableDrivers.length === 0) {
      console.log('No available drivers');
      return res.status(404).send('No available drivers');
    }

    let closestDriver = null;
    let minDistance = Infinity;

    availableDrivers.forEach(driver => {
      const driverDistance = calculateDistance(
        pickupLat,
        pickupLng,
        driver.current_latitude,
        driver.current_longitude
      );

      console.log(`Driver ${driver.driverID} distance: ${driverDistance} km`);

      if (driverDistance < minDistance) {
        minDistance = driverDistance;
        closestDriver = driver;
      }
    });

    if (!closestDriver) {
      console.log('No nearby drivers found');
      return res.status(404).send('No nearby drivers found');
    }

    const ride = {
      rideID: mockRides.length + 1,
      driverID: closestDriver.driverID,
      distance,
      pickupLocation,
      dropoffLocation,
      price,
      status: 'assigned'
    };

    mockRides.push(ride);
    closestDriver.is_available = false;

    // Send real-time notification to the driver using Socket.io
    io.to(`driver_${closestDriver.driverID}`).emit('rideAssigned', ride);

    console.log(`Ride assigned to driver ${closestDriver.driverID}`);
    res.status(200).json({
      message: `Ride assigned to driver ${closestDriver.driverID}`,
      rideDetails: ride,
      driverDistance: minDistance.toFixed(2) + ' km'
    });
  } catch (error) {
    console.error('Error assigning ride:', error);
    res.status(500).send('Error assigning ride');
  }
};
