// services/riderService.js
const prisma = require('../prismaClient');

// Find a rider by user ID
const findRiderByUserId = async (userID) => {
  return await prisma.rider.findUnique({
    where: { userID },
    include: { Trips: true },
  });
};

// Create a new rider
const createRider = async ({ userID, location }) => {
  return await prisma.rider.create({
    data: {
      userID,
      location,
    },
  });
};

// Get all riders
const getAllRiders = async () => {
  return await prisma.rider.findMany();
};

module.exports = {
  findRiderByUserId,
  createRider,
  getAllRiders,
};
