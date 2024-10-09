let mockDrivers = [
  { driverID: 1, current_latitude: 37.7749, current_longitude: -122.4194, is_available: true },
  { driverID: 2, current_latitude: 37.7849, current_longitude: -122.4094, is_available: true },
  { driverID: 3, current_latitude: 37.7649, current_longitude: -122.4294, is_available: true }
];

let mockRides = [];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = value => (value * Math.PI) / 180;
  const R = 6371; // km (Earth's radius)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

exports.sendRide = (req, res) => {
  const { pickupLat, pickupLng, distance, pickupLocation, dropoffLocation, price } = req.body;

  try {
    const availableDrivers = mockDrivers.filter(d => d.is_available);
    if (availableDrivers.length === 0) {
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

      if (driverDistance < minDistance) {
        minDistance = driverDistance;
        closestDriver = driver;
      }
    });

    if (!closestDriver) {
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

    res.status(200).json({
      message: `Ride assigned to driver ${closestDriver.driverID}`,
      rideDetails: ride,
      driverDistance: minDistance.toFixed(2) + ' km'
    });
  } catch (error) {
    res.status(500).send('Error sending the ride to the nearest driver');
  }
};
