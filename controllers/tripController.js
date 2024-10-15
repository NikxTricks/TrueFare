const Trip = require('../models/trip');

//Create a trip
exports.createTrip = async (req, res) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();
    res.status(201).send(trip);
  } catch (error) {
    res.status(400).send(error);
  }
};

//Get all trips
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find();
    res.send(trips);
  } catch (error) {
    res.status(500).send(error);
  }
};

//Get a trip by ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).send();
    res.send(trip);
  } catch (error) {
    res.status(500).send(error);
  }
};