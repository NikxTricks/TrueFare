const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Assuming Stripe is used for payments
const io = require('../socket').getIO(); // Import Socket.io instance from socket.js
const { PrismaClient, DriverStatus } = require('@prisma/client'); // Import Prisma client
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
// Update an existing driver's coordinates in the database
exports.updateDriverLocation = async (req, res) => {
  const { userID, latitude, longitude } = req.body;

  try {
    // Update the driver's location in the database
    const updatedDriver = await prisma.user.update({
      where: { userID: userID },
      data: {
        location: {
          userLat: latitude,
          userLng: longitude,
        },
        driverStatus: 'Active',  // Set the status to active if needed
        disabled: false,
      },
    });

    console.log('Driver location updated in database:', updatedDriver);
    res.status(200).json({ message: 'Driver location updated successfully', driver: updatedDriver });
  } catch (error) {
    console.error('Database error (driver update failed):', error.message);
    res.status(500).json({ message: 'Failed to update driver location' });
  }
};



// Find the closest driver for a given user location using the active drivers list
exports.getClosestDriver = async (req, res) => {
  const { userLat, userLng } = req.query;

  console.log('Received request to find closest driver for:', { userLat, userLng });

  try {
    // Fetch all available drivers from the User model
    const availableDrivers = await prisma.user.findMany({
      where: { driverStatus: DriverStatus.Active, disabled: false },
      select: {
        userID: true,
        location: true, // Assuming location is stored as { userLat: 45, userLng: 45 }
      },
    });

    if (availableDrivers.length === 0) {
      console.log('No available drivers found.');
      return res.status(404).send('No available drivers found');
    }

    let minDistance = Infinity;
    let closestDriver = null;

    // Iterate over available drivers to find the closest one
    availableDrivers.forEach((driver) => {
      const driverLat = driver.location?.userLat;
      const driverLng = driver.location?.userLng;

      // Ensure driver has valid latitude and longitude
      if (driverLat !== undefined && driverLng !== undefined) {
        const driverDistance = calculateDistance(
          parseFloat(userLat),
          parseFloat(userLng),
          parseFloat(driverLat),
          parseFloat(driverLng)
        );

        if (driverDistance < minDistance) {
          minDistance = driverDistance;
          closestDriver = driver;
        }
      } else {
        console.log(`Driver ${driver.userID} does not have valid location data.`);
      }
    });

    if (!closestDriver) {
      console.log('No nearby drivers found.');
      return res.status(404).send('No nearby drivers found');
    }

    console.log('Closest driver found:', closestDriver);

    // Return closest driver details in the response
    res.status(200).json({
      driverID: closestDriver.userID,
      distance: minDistance.toFixed(2) + ' km',
      location: closestDriver.location,
    });
  } catch (error) {
    console.error('Error finding the closest driver:', error);
    res.status(500).send('Error finding the closest driver');
  }
};

// Process payment via Stripe
exports.processPayment = async (req, res) => {
  const { amount, currency, email } = req.body;

  try {
    // Fetch the payment method for the user based on email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { cardNumber: true },
    });

    if (!user || !user.cardNumber) {
      return res.status(400).json({ message: 'Payment method not found for this user' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: user.cardNumber, 
      confirm: true,
    });

    res.status(200).send('Payment successful');
  } catch (error) {
    console.error('Error processing payment:', error);
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


// Set a driver to inactive and remove them from the active drivers list
exports.setDriverInactive = async (req, res) => {
  const { driverID } = req.body;

  try {
    await prisma.driver.update({
      where: { driverID },
      data: { status: 'Inactive', disabled: true },
    });

    console.log(`Driver ${driverID} set to inactive`);
    res.status(200).json({ message: `Driver ${driverID} is now inactive` });
  } catch (error) {
    console.error(`Failed to set driver ${driverID} as inactive:`, error.message);
    res.status(500).json({ message: `Failed to set driver ${driverID} as inactive` });
  }
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
  const { price, source, destination, riderID, currency = 'usd', email } = req.body;

  try {
    // Process payment first
    console.log("Processing payment for rider:", riderID);
    const paymentResponse = await exports.processPayment({
      body: { amount: Math.round(price * 100), currency, email }
    }, {
      status: () => ({ send: (message) => message }),
    });

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

      // Notify the driver and wait for response
      const notificationResult = await notifyDriver(riderID, source, destination, price, potentialDriver);

      if (notificationResult) {
        // Driver accepted the ride
        driverAssigned = true;
        console.log(`Driver ${potentialDriver.driverID} accepted the ride`);
      } else {
        // Update driver availability in the database
        await prisma.driver.update({
          where: { driverID: potentialDriver.driverID },
          data: { status: 'Inactive' },
        });
      }
    }

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



