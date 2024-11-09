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
