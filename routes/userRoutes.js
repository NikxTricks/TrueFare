const express = require('express');
const userController = require('../controllers/userController');
const { updateSubscriptionStatus, updatePhoneNumber } = userController;

const router = express.Router();

// Route to create a new user
router.post('/create', userController.createUser);

// Route to get a user by ID
router.get('/:id', userController.getUserById);

router.get('/:email/id', userController.getUserIdByEmail);

// Route to update a user’s location
router.put('/:id/location', userController.updateUserLocation);

// Route to verify a user (e.g., login endpoint)
router.post('/verify', userController.verifyUser);

// Route to activate a user
router.put('/:userID/activate', userController.makeUserActive);

// Route to deactivate a user
router.put('/:userID/deactivate', userController.makeUserInactive);

// Route to update subscription status
router.patch('/:userID/subscription', updateSubscriptionStatus);

// Route to update phone number
router.patch('/:userID/phone', updatePhoneNumber);

module.exports = router;
