const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  officeType: { type: String, enum: ['notary', 'legal', 'law_firm', 'other'], default: 'legal' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  subscriptionPlan: { type: String, enum: ['basic', 'professional', 'enterprise'], default: 'basic' },
  storageQuotaMB: { type: Number, default: 51200 },
  storageUsedMB: { type: Number, default: 0 },
  logoKey: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Office', officeSchema);