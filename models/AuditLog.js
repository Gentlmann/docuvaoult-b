const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' }, // null for super_admin platform actions
  action: { type: String, required: true }, // e.g. 'LOGIN', 'UPLOAD_DOCUMENT'
  resourceType: String,
  resourceId: mongoose.Schema.Types.ObjectId,
  ipAddress: String,
  metadata: mongoose.Schema.Types.Mixed,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);