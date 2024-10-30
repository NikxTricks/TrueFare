// services/tripService.js
const prisma = require('../prismaClient');

// Create a new trip
const createTrip = async ({ status, riderID, driverID, source, destination }) => {
  return await prisma.trip.create({
    data: {
      status,
      riderID,
      driverID,
      source,
      destination,
    },
  });
};

// Find a trip by ID
const findTripById = async (id) => {
  return await prisma.trip.findUnique({
    where: { id },
    include: { Rider: true, Driver: true, Payment: true },
  });
};

// Update trip status
const updateTripStatus = async (id, status) => {
  return await prisma.trip.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  createTrip,
  findTripById,
  updateTripStatus,
};
