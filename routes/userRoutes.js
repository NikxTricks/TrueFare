// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define user-related routes
router.post('/create', userController.createUser);
router.post('/verify', userController.verifyUser);

module.exports = router;