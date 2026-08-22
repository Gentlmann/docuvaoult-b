const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
  action: { type: String, required: true },
  resourceType: String,
  resourceId: mongoose.Schema.Types.ObjectId,
  ipAddress: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);