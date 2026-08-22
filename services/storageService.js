const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const getUploadPath = () => UPLOAD_DIR;

const deleteFile = (storageKey) => {
  const filePath = path.join(UPLOAD_DIR, storageKey);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Calculates total bytes used — current files + all historical versions.
// Pass an officeId for one office's usage, or omit it for platform-wide total.
const getStorageUsageBytes = async (officeId) => {
  const matchStage = officeId ? { officeId } : {};

  const docResult = await Document.aggregate([
    { $match: matchStage },
    { $group: { _id: null, total: { $sum: '$fileSize' } } },
  ]);

  const versionResult = await DocumentVersion.aggregate([
    { $match: matchStage },
    { $group: { _id: null, total: { $sum: '$fileSize' } } },
  ]);

  return (docResult[0]?.total || 0) + (versionResult[0]?.total || 0);
};

module.exports = { getUploadPath, deleteFile, getStorageUsageBytes };