const mongoose = require('mongoose');

const accessGrantSchema = new mongoose.Schema({
  grantedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // super_admin
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
  reason: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('AccessGrant', accessGrantSchema);