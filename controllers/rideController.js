const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Assuming Stripe is used for payments
const io = require('../socket').getIO(); // Import Socket.io instance from socket.js
const { PrismaClient } = require('@prisma/client'); // Import Prisma client
const prisma = new PrismaClient(); // Initialize Prisma client

// In-memory list of active drivers (temporary storage for local use)
let activeDrivers = [];

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;  // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;  // Distance in km
}

// Create a new driver and add to active list and database (if available)
exports.createDriver = async (req, res) => {
  const { driverID, latitude, longitude } = req.body;

  const newDriver = {
    driverID,
    current_latitude: latitude,
    current_longitude: longitude,
    is_available: true,
  };

  // Add the driver to the active drivers list
  activeDrivers.push(newDriver);
  console.log('Driver added to active list:', newDriver);

  try {
    // Attempt to add driver to the database (if enabled)
    await prisma.driver.create({
      data: {
        userID: driverID,
        location: { type: 'Point', coordinates: [longitude, latitude] },
        status: 'Active',
      },
    });
    res.status(201).json({ message: 'Driver created and added to active list and database' });
  } catch (error) {
    console.error('Database error (driver creation failed):', error.message);
    res.status(201).json({ message: 'Driver created and added to active list only (database not available)' });
  }
};

// Find the closest driver for a given user location using the active drivers list

exports.getClosestDriver = async (req, res) => {
  const { userLat, userLng } = req.query;

  console.log('Received request to find closest driver for:', { userLat, userLng });
  console.log('Current active drivers:', activeDrivers); // Log all active drivers

  try {
    const availableDrivers = activeDrivers.filter((driver) => driver.is_available);
    console.log('Available drivers for this request:', availableDrivers);

    if (availableDrivers.length === 0) {
      console.log('No available drivers found.');
      return res.status(404).send('No available drivers found');
    }

    let minDistance = Infinity;
    let closestDriver = null;

    availableDrivers.forEach((driver) => {
      console.log(`Calculating distance with user coordinates: (${userLat}, ${userLng}) and driver coordinates: (${driver.current_latitude}, ${driver.current_longitude})`);

      const driverDistance = calculateDistance(
        parseFloat(userLat),
        parseFloat(userLng),
        driver.current_latitude,
        driver.current_longitude
      );

      console.log(`Distance to driver ${driver.driverID}: ${driverDistance.toFixed(2)} km`);

      if (driverDistance < minDistance) {
        minDistance = driverDistance;
        closestDriver = driver;
      }
    });

    if (!closestDriver) {
      console.log('No nearby drivers found.');
      return res.status(404).send('No nearby drivers found');
    }

    console.log('Closest driver found:', closestDriver);

    res.status(200).json({
      driverID: closestDriver.driverID,
      distance: minDistance.toFixed(2) + ' km',
    });
  } catch (error) {
    console.error('Error finding the closest driver:', error);
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

  io.to(`driver_${driverID}`).emit('rideAssigned', { message: 'New ride assigned to you' });

  res.status(200).send('Notification sent to driver');
};

// Accept a rider by the driver
exports.acceptRider = async (req, res) => {
  const { rideID, driverID } = req.body;

  try {
    let ride = mockRides.find((r) => r.rideID === rideID);
    if (!ride) {
      return res.status(404).send('Ride not found');
    }

    if (ride.status !== 'pending') {
      return res.status(400).send('Ride is no longer available');
    }

    ride.driverID = driverID;
    ride.status = 'accepted';

    io.to(`driver_${driverID}`).emit('rideAccepted', { rideID, message: 'You have accepted the ride' });

    res.status(200).send('Ride accepted successfully');
  } catch (error) {
    res.status(500).send('Error accepting the ride');
  }
};

// Assign the closest driver to the ride using active drivers list
exports.assignClosestDriver = (req, res) => {
  const { pickupLat, pickupLng, dropoffLat, dropoffLng, pickupLocation, dropoffLocation, price } = req.body;
  console.log('Received ride assignment request:', req.body);

  const distance = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
  const availableDrivers = activeDrivers.filter((d) => d.is_available);

  if (availableDrivers.length === 0) {
    console.log('No available drivers');
    return res.status(404).send('No available drivers');
  }

  let closestDriver = null;
  let minDistance = Infinity;

  availableDrivers.forEach((driver) => {
    const driverDistance = calculateDistance(
      pickupLat,
      pickupLng,
      driver.current_latitude,
      driver.current_longitude
    );
    if (driverDistance < minDistance) {
      minDistance = driverDistance;
      closestDriver = driver;
    }
  });

  if (!closestDriver) {
    console.log('No nearby drivers found');
    return res.status(404).send('No nearby drivers found');
  }

  const rideDetails = {
    pickupLocation,
    dropoffLocation,
    distance: distance.toFixed(2) + ' km',
    price,
  };

  io.to(`driver_${closestDriver.driverID}`).emit('rideAssigned', {
    message: 'New ride assigned to you',
    rideDetails,
  });

  console.log(`Ride assigned to driver ${closestDriver.driverID}`);
  res.status(200).json({
    message: `Ride assigned to driver ${closestDriver.driverID}`,
    rideDetails,
    driverDistance: minDistance.toFixed(2) + ' km',
  });
};

// Set a driver to inactive and remove them from the active drivers list
exports.setDriverInactive = (req, res) => {
  const { driverID } = req.body;

  activeDrivers = activeDrivers.filter((driver) => driver.driverID !== driverID);
  console.log(`Driver ${driverID} set to inactive and removed from active list`);

  res.status(200).json({ message: `Driver ${driverID} is now inactive` });
};


const customerEmail = "test";
async function getPaymentMethodIdByEmail(email) {
  try {
    const customer = await prisma.user.findUnique({
      where: { email: email },
      select: { paymentMethodId: true }  // Assume 'paymentMethodId' is stored in the user model
    });

    if (!customer || !customer.paymentMethodId) {
      throw new Error('Payment method not found for this email');
    }

    return customer.paymentMethodId;
  } catch (error) {
    console.error('Error fetching payment method:', error);
    throw error;
  }
}

// Process payment via Stripe with Prisma-based retrieval
exports.processPayment = async (req, res) => {
  const { amount, currency } = req.body;

  try {
    // Fetch the paymentMethodId from the database
    const paymentMethodId = await getPaymentMethodIdByEmail(customerEmail);

    // Process payment with the retrieved payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,  // Use payment method retrieved from Prisma
      confirm: true,
    });

    res.status(200).send('Payment successful');
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).send('Error processing payment');
  }
};

exports.rideConfirm = async (req, res) => {
  const { price, source, destination, riderID, paymentMethodId, currency = 'usd' } = req.body;

  try {
    //process payment 
    console.log("Processing payment for rider:", riderID);
    const paymentResponse = await exports.processPayment({
      body: { amount: Math.round(price * 100), currency, paymentMethodId }
    }, {
      status: () => ({ send: (message) => message }),
    });

    //check if payment was successful
    if (paymentResponse !== 'Payment successful') {
      return res.status(400).json({ message: 'Payment failed' });
    }

    console.log("Payment successful for rider:", riderID);


    let driverAssigned = false;
    let potentialDriver;

    // Keep finding the closest driver until one accepts or no drivers are left
    while (!driverAssigned) {

      const closestDriverResponse = await exports.getClosestDriver({
        query: { userLat: source.latitude, userLng: source.longitude }
      }, {
        status: (code) => ({
          json: (data) => ({ code, data }),
          send: (message) => ({ code, message }),
        })
      });
      if (closestDriverResponse.code === 404) {
        return res.status(404).json({ message: 'No available drivers found' });
      }

      potentialDriver = closestDriverResponse.data;

      // Notify the driver, see if they accept or not 
      const notificationResult = await notifyDriver(riderID, source, destination, price, potentialDriver);

      // assuming result from notifyDriver is true or false 
      if (notificationResult) {
        // driver accepted the ride
        driverAssigned = true;
        console.log(`Driver ${potentialDriver.driverID} accepted the ride`);
      } else {
        // If the driver declines, remove them from the active driver list temporarily
        activeDrivers = activeDrivers.filter(driver => driver.driverID !== potentialDriver.driverID);
      }
    }

    // return the driver details
    res.status(200).json({
      message: 'Driver assigned',
      driverID: potentialDriver.driverID,
      distance: potentialDriver.distance,
    });
    
  } catch (error) {
    console.error('Error in ride confirmation:', error.message);
    res.status(500).json({ message: 'Ride confirmation failed', error: error.message });
  }
};
// Notify the driver of a new ride and await their response
function notifyDriver(riderID, source, destination, price, driver) {
  return new Promise((resolve) => {
    // Prepare the ride details to send to the driver
    const rideDetails = {
      riderID,
      pickupLocation: source,
      dropoffLocation: destination,
      price: price, // Amount the driver will earn
      distance: calculateDistance(source.latitude, source.longitude, driver.current_latitude, driver.current_longitude).toFixed(2) + ' km',
      // estimatedTime: '10 mins', need to implement 
    };

    // Emit the 'rideAssigned' event to the specific driver
    io.to(`driver_${driver.driverID}`).emit('rideAssigned', rideDetails);

    console.log(`Notified driver ${driver.driverID} with ride details`, rideDetails);

    // Listen for the driver's response (accept or decline)
    const responseHandler = (response) => {
      if (response.accepted) {
        console.log(`Driver ${driver.driverID} accepted the ride`);
        resolve(true);
      } else {
        console.log(`Driver ${driver.driverID} declined the ride`);
        resolve(false);
      }

      // Remove the listener after receiving a response
      io.to(`driver_${driver.driverID}`).off('rideResponse', responseHandler);
    };

    // Attach the response listener to the driver's channel
    io.to(`driver_${driver.driverID}`).on('rideResponse', responseHandler);
  });
}



