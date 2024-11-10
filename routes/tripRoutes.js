const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// Create a new trip
router.post('/', tripController.createTrip);

// Get all trips
router.get('/', tripController.getAllTrips);

// Get trip by ID
router.get('/:id', tripController.getTripById);

// Get trips by riderID
router.get('/rider/:riderID', tripController.getTripsByRiderId);

// Update trip status to "Ongoing"
router.put('/:id/start', tripController.startTrip);

// Update trip status to "Completed"
router.put('/:id/complete', tripController.completeTrip);

// Update trip status to "Canceled"
router.put('/:id/cancel', tripController.cancelTrip);

module.exports = router;
