const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true, index: true },
  versionNumber: { type: Number, required: true },
  fileName: { type: String, required: true },
  storageKey: { type: String, required: true },
  fileSize: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changeDescription: String,
}, { timestamps: true });

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);