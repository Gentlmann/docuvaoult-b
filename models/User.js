const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'office_admin', 'staff'], required: true },
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', default: null },
  isActive: { type: Boolean, default: true },
  permissions: {
    clients: { type: String, enum: ['none', 'read', 'write'], default: 'write' },
    cases: { type: String, enum: ['none', 'read', 'write'], default: 'write' },
    documents: { type: String, enum: ['none', 'read', 'write'], default: 'write' },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);