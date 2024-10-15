const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tripID: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  method: { type: String, enum: ['Cash', 'Card', 'UPI'], required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);