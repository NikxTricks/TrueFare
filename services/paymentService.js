// services/paymentService.js
const prisma = require('../prismaClient');

// Create a payment
const createPayment = async ({ method, amount, tripID }) => {
  return await prisma.payment.create({
    data: {
      method,
      amount,
      tripID,
    },
  });
};

// Find a payment by trip ID
const findPaymentByTripId = async (tripID) => {
  return await prisma.payment.findUnique({
    where: { tripID },
  });
};

module.exports = {
  createPayment,
  findPaymentByTripId,
};
