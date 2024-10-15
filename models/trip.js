const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  driverID: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  paymentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  status: { type: String, enum: ['Pending', 'Ongoing', 'Completed'], default: 'Pending' },
  source: { type: { type: String, enum: ['Point'], required: true }, coordinates: [Number] },
  destination: { type: { type: String, enum: ['Point'], required: true }, coordinates: [Number] },
  createdAt: { type: Date, default: Date.now },
});

tripSchema.index({ source: '2dsphere', destination: '2dsphere' });

module.exports = mongoose.model('Trip', tripSchema);