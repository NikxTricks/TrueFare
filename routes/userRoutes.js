const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Route to create a new user
router.post('/', userController.createUser);

// Route to get a user by ID
router.get('/:id', userController.getUserById);

// Route to update a user’s location
router.put('/:id/location', userController.updateUserLocation);

// Route to verify a user (e.g., login endpoint)
router.post('/verify', userController.verifyUser);

module.exports = router;
