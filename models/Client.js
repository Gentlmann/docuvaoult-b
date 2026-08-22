const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: String,
  email: String,
  address: String,
  notes: String,
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);