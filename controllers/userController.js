const { PrismaClient, DriverStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

exports.createUser = async (req, res) => {
  const { name, email, password, cardNumber } = req.body;

  try {
    // Hash the password on the backend
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the User with the hashed password and initialize `isActive` as false
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cardNumber,
        driverStatus: DriverStatus.Inactive, // Default to inactive upon creation
        disabled: false,
        createdAt: new Date(),
      },
    });

    // Initialize Rider and Driver profiles for the new User
    const rider = await prisma.rider.create({
      data: { userID: user.userID },
    });

    const driver = await prisma.driver.create({
      data: {
        userID: user.userID,
        disabled: false,
      },
    });

    res.status(201).json({
      message: 'User, Rider, and Driver profiles created successfully',
      user,
      rider,
      driver,
    });
  } catch (error) {
    console.error('Error creating user, rider, or driver:', error.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userID: parseInt(req.params.id) },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.updateUserLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  const userID = parseInt(req.params.id);

  try {
    const updatedUser = await prisma.user.update({
      where: { userID },
      data: {
        location: { type: 'Point', coordinates: [longitude, latitude] },
      },
    });
    res.status(200).json({ message: 'User location updated', user: updatedUser });
  } catch (error) {
    console.error('Error updating user location:', error.message);
    res.status(500).json({ error: 'Failed to update user location' });
  }
};

exports.verifyUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'User verified', user });
  } catch (error) {
    console.error('Error verifying user:', error.message);
    res.status(500).json({ error: 'Error verifying user' });
  }
};

//Makes isActive true
exports.makeUserActive = async (req, res) => {
  const { userID } = req.params;

  try {
    const user = await prisma.user.update({
      where: { userID: parseInt(userID) },
      data: { isActive: true },
    });
    res.status(200).json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
};

// Method to make user isActive false
exports.makeUserInactive = async (req, res) => {
  const { userID } = req.params;

  try {
    const user = await prisma.user.update({
      where: { userID: parseInt(userID) },
      data: { isActive: false },
    });
    res.status(200).json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};