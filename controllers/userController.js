// controllers/userController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createUser = async (req, res) => {
  const { name, email, password, cardNumber } = req.body;
  const cardNumberNew = "123";
  try {
    // Step 1: Create the User
    console.log("Before creation");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        createdAt: new Date(),
        cardNumber,
      },
    });
    console.log("After creation");

    // Step 2: Initialize Rider and Driver profiles for the new User
    const rider = await prisma.rider.create({
      data: {
        userID: user.userID, // Foreign key to User
      },
    });

    const driver = await prisma.driver.create({
      data: {
        userID: user.userID, // Foreign key to User
        status: 'Inactive', // Set initial status
        disabled: false,
        location: { type: 'Point', coordinates: [0, 0] }, // Set default location
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

exports.verifyUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.hashedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If verification is successful, return the user data
    res.status(200).json({ message: 'User verified', user });
  } catch (error) {
    console.error('Error verifying user:', error.message);
    res.status(500).json({ error: 'Error verifying user' });
  }
};