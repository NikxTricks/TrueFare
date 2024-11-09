const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    res.status(400).json({ error: error.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
