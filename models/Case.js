const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true },
  title: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  caseType: String,
  status: { type: String, enum: ['open', 'pending', 'closed', 'archived'], default: 'open' },
  description: String,
  openingDate: { type: Date, default: Date.now },
  closingDate: Date,
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);