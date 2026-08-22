const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const LOGO_DIR = path.join(__dirname, '..', 'uploads', 'logos');
if (!fs.existsSync(LOGO_DIR)) {
  fs.mkdirSync(LOGO_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, LOGO_DIR),
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const allowedTypes = ['.png', '.jpg', '.jpeg', '.svg'];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for logos'), false);
  }
};

const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = uploadLogo;