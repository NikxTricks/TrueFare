// controllers/riderController.js

const riderService = require('../services/riderService');

// Create a new rider
exports.createRider = async (req, res) => {
  try {
    const { userID, location, lastKnownLocation, disabled } = req.body;
    const rider = await riderService.createRider({ userID, location, lastKnownLocation, disabled });
    res.status(201).json(rider);
  } catch (error) {
    res.status(400).json({ error: error.message }); 
  }
};

// Get all riders
exports.getAllRiders = async (req, res) => {
  try {
    const riders = await riderService.getAllRiders(); 
    res.status(200).json(riders);
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
};

// Get rider by ID
exports.getRiderById = async (req, res) => {
  try {
    const rider = await riderService.getRiderById(parseInt(req.params.id)); 
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' }); 
    }
    res.status(200).json(rider); 
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
};