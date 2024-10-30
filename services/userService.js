// services/userService.js

const prisma = require('../prismaClient');

// Find user by Google ID
const findUserByGoogleId = async (googleId) => {
  return await prisma.user.findUnique({
    where: { googleId },
    include: { Rider: true, Driver: true },
  });
};

// Create a new user
const createUser = async ({ googleId, name, email }) => {
  return await prisma.user.create({
    data: {
      googleId,
      name,
      email,
    },
  });
};

// Get all users
const getAllUsers = async () => {
  return await prisma.user.findMany({
    include: { Rider: true, Driver: true },
  });
};

// Get user by ID
const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: { Rider: true, Driver: true },
  });
};

// Update user
const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

// Delete user
const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

module.exports = {
  findUserByGoogleId,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
