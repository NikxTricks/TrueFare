const axios = require('axios');

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

    // Call Google Maps Distance Matrix API
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

    // Step 4: Find the closest driver
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
