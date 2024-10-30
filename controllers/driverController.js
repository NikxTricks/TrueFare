// controllers/driverController.js

const driverService = require('../services/driverService');

// Create a new driver
exports.createDriver = async (req, res) => {
  try {
    const { userID, status, location, disabled } = req.body;
    const driver = await driverService.createDriver({ userID, status, location, disabled });
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await driverService.getAllDrivers();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const driver = await driverService.getDriverById(parseInt(req.params.id));
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};