// services/driverService.js
const prisma = require('../prismaClient');

// Find a driver by user ID
const findDriverByUserId = async (userID) => {
  return await prisma.driver.findUnique({
    where: { userID },
    include: { Trips: true },
  });
};

// Create a new driver
const createDriver = async ({ userID, status = 'Inactive', location }) => {
  return await prisma.driver.create({
    data: {
      userID,
      status,
      location,
    },
  });
};

// Get all drivers
const getAllDrivers = async () => {
  return await prisma.driver.findMany();
};

module.exports = {
  findDriverByUserId,
  createDriver,
  getAllDrivers,
};
