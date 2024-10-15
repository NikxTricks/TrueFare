const express = require('express');
const Driver = require('../models/driver');
const router = express.Router();

// Create a new driver
router.post('/', async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).send(driver);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.send(drivers);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).send();
    res.send(driver);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;