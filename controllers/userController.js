// controllers/userController.js

const userService = require('../services/userService');
const riderService = require('../services/riderService');
const driverService = require('../services/driverService');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { googleId, name, email, role } = req.body; // role: 'rider' or 'driver'

    // Create user
    const user = await userService.createUser({ googleId, name, email });

    // Depending on the role, create a Rider or Driver
    if (role === 'rider') {
      const rider = await riderService.createRider({ userID: user.id });
      user.Rider = rider;
    } else if (role === 'driver') {
      const driver = await driverService.createDriver({ userID: user.id });
      user.Driver = driver;
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userID = parseInt(req.params.id);
    const data = req.body;
    const updatedUser = await userService.updateUser(userID, data);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userID = parseInt(req.params.id);
    await userService.deleteUser(userID);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
