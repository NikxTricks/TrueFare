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

// Get trips by riderID
exports.getTripsByRiderId = async (req, res) => {
  const riderID = parseInt(req.params.riderID);
  try {
    const trips = await prisma.trip.findMany({ where: { riderID } });
    if (trips.length === 0) {
      return res.status(404).json({ message: 'No trips found for this rider' });
    }
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update trip status to "Ongoing"
exports.startTrip = async (req, res) => {
  const tripID = parseInt(req.params.id);
  try {
    const trip = await prisma.trip.update({
      where: { id: tripID },
      data: { status: 'Ongoing' },
    });
    res.status(200).json({ message: 'Trip started', trip });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start trip' });
  }
};

// Update trip status to "Completed"
exports.completeTrip = async (req, res) => {
  const tripID = parseInt(req.params.id);
  try {
    const trip = await prisma.trip.update({
      where: { id: tripID },
      data: { status: 'Completed' },
    });
    res.status(200).json({ message: 'Trip completed', trip });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete trip' });
  }
};

// Update trip status to "Canceled"
exports.cancelTrip = async (req, res) => {
  const tripID = parseInt(req.params.id);
  try {
    const trip = await prisma.trip.update({
      where: { id: tripID },
      data: { status: 'Canceled' },
    });
    res.status(200).json({ message: 'Trip canceled', trip });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel trip' });
  }
};

exports.getTripSourceDestination = async (req, res) => {
  const tripID = parseInt(req.params.id);
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripID },
      select: {
        source: true,
        destination: true,
      },
    });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
