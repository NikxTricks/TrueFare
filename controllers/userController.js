const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

exports.createUser = async (req, res) => {
  const { name, email, password, cardNumber } = req.body;

  try {
    // Hash the password on the backend
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the User with the hashed password
    console.log("Before creation");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store hashed password here
        createdAt: new Date(),
        cardNumber,
      },
    });
    console.log("After creation");

    // Initialize Rider and Driver profiles for the new User
    const rider = await prisma.rider.create({
      data: { userID: user.userID },
    });

    const driver = await prisma.driver.create({
      data: {
        userID: user.userID,
        status: 'Inactive',
        disabled: false,
        location: { type: 'Point', coordinates: [0, 0] },
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
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
