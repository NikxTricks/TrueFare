// controllers/driverController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new driver
exports.createDriver = async (req, res) => {
  try {
    const driver = await prisma.driver.create({
      data: {
        ...req.body,
        status: 'Active',
      },
    });
    res.status(201).json(driver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(400).json({ error: 'Failed to create driver' });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany();
    res.status(200).json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
};

// Get a driver by driverID
exports.getDriverById = async (req, res) => {
  try {
    const driverID = parseInt(req.params.id);
    const driver = await prisma.driver.findUnique({ where: { driverID } });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json(driver);
  } catch (error) {
    console.error('Error fetching driver by ID:', error);
    res.status(500).json({ error: 'Failed to fetch driver' });
  }
};

// Get a driver by userID
exports.getDriverByUserId = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID);
    const driver = await prisma.driver.findUnique({
      where: { userID },
      select: { driverID: true },
    });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.status(200).json(driver);
  } catch (error) {
    console.error('Error fetching driver by userID:', error);
    res.status(500).json({ error: 'Failed to fetch driver' });
  }
};

// Update an existing driver's location
exports.updateDriverLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  const driverID = parseInt(req.params.id);

  try {
    const updatedDriver = await prisma.driver.update({
      where: { driverID },
      data: {
        location: { type: 'Point', coordinates: [longitude, latitude] },
      },
    });
    res.status(200).json({ message: 'Driver location updated', driver: updatedDriver });
  } catch (error) {
    console.error('Error updating driver location:', error);
    res.status(500).json({ error: 'Failed to update driver location' });
  }
};
