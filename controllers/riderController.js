const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createRider = async (req, res) => {
  try {
    const rider = await prisma.rider.create({ data: req.body });
    res.status(201).json(rider);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllRiders = async (req, res) => {
  try {
    const riders = await prisma.rider.findMany();
    res.status(200).json(riders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRiderById = async (req, res) => {
  try {
    const rider = await prisma.rider.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }
    res.status(200).json(rider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
