// driverRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const driverController = require('../controllers/driverController');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  const { userID, status, disabled, location } = req.body;

  try {
    const driver = await prisma.driver.create({
      data: {
        userID,
        status,
        disabled,
        location,
      },
    });
    res.status(201).json(driver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(400).json({ error: 'Failed to create driver' });
  }
});

router.get('/', async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany();
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

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

// Get driverID by userID
router.get('/user/:userID', async (req, res) => {
  try {
    const userID = parseInt(req.params.userID);
    const driver = await prisma.driver.findUnique({
      where: { userID },
      select: { driverID: true }
    });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver by userID:', error);
    res.status(500).json({ error: 'Failed to fetch driver' });
  }
});

// Update driver location
router.put('/:id/location', driverController.updateDriverLocation);

module.exports = router;
