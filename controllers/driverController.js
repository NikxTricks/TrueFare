let mockDrivers = [
    { driverID: 1, current_latitude: 37.7749, current_longitude: -122.4194 },
    { driverID: 2, current_latitude: 37.7849, current_longitude: -122.4094 },
    { driverID: 3, current_latitude: 37.7649, current_longitude: -122.4294 }
  ];
  
  exports.updateLocation = async (req, res) => {
    const { driverID, latitude, longitude } = req.body;
  
    try {
      const driver = mockDrivers.find(d => d.driverID === driverID);
      if (!driver) {
        return res.status(404).send('Driver not found');
      }
  
      driver.current_latitude = latitude;
      driver.current_longitude = longitude;
  
      res.status(200).send('Driver location updated successfully');
    } catch (error) {
      res.status(500).send('Error updating driver location');
    }
  };
  