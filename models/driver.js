const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: { type: Date },
  location: { type: { type: String, enum: ['Point'], required: true }, coordinates: { type: [Number], required: true } },
  createdAt: { type: Date, default: Date.now },
});

driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);