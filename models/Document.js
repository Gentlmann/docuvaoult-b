const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileType: String,
  fileSize: Number,
  storageKey: { type: String, required: true },
  category: { type: String, enum: ['identification', 'contracts', 'agreements', 'certificates', 'legal', 'case_documents', 'financial', 'other'], default: 'other' },
  tags: [String],
  description: String,
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true, index: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isArchived: { type: Boolean, default: false },
  currentVersion: { type: Number, default: 1 },

  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);