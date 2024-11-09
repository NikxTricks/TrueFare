const express = require('express');
const { PrismaClient } = require('@prisma/client'); // Import Prisma Client
const prisma = new PrismaClient();
const router = express.Router();

// Create a new driver
router.post('/', async (req, res) => {
  const { userID, status, disabled, location } = req.body;

  try {
    const driver = await prisma.driver.create({
      data: {
        userID,
        status,
        disabled,
        location, // location is assumed to be a JSON object { type: 'Point', coordinates: [longitude, latitude] }
      },
    });
    res.status(201).json(driver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(400).json({ error: 'Failed to create driver' });
  }
});

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany();
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// Get a driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driverID = parseInt(req.params.id);
    const driver = await prisma.driver.findUnique({
      where: { driverID },
    });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ error: 'Failed to fetch driver' });
  }
});
router.put('/:id', driverController.updateDriverLocation);

module.exports = router;