const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createTrip = async (req, res) => {
  try {
    const trip = await prisma.trip.create({ data: req.body });
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany();
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
