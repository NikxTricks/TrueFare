// controllers/tripController.js

const tripService = require('../services/tripService');

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const { status, source, destination, riderID, driverID } = req.body;
    const trip = await tripService.createTrip({ status, source, destination, riderID, driverID });
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all trips
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await tripService.getAllTrips();
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trip by ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await tripService.getTripById(parseInt(req.params.id));
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};