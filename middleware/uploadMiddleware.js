const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { getUploadPath } = require('../services/storageService');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadPath());
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid collisions/overwrites
    const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;