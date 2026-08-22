const fs = require('fs');
const path = require('path');
const FileType = require('file-type');

// Maps allowed extensions to the MIME types file-type actually detects from content
const ALLOWED_MIME_TYPES = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
};

// Runs AFTER multer has already saved the file to disk
const validateFileContent = async (req, res, next) => {
  if (!req.file) {
    return next(); // nothing to check — let the controller's own "no file" check handle this
  }

  try {
    const filePath = path.join(req.file.destination, req.file.filename);
    const detectedType = await FileType.fromFile(filePath);

    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedMimes = ALLOWED_MIME_TYPES[ext];

    // Some old .doc files and certain edge cases don't have detectable magic bytes —
    // we only REJECT when detection succeeds AND clearly doesn't match.
    if (detectedType && allowedMimes && !allowedMimes.includes(detectedType.mime)) {
      fs.unlinkSync(filePath); // delete the mismatched file immediately
      return res.status(400).json({
        message: `File content does not match its extension. Expected ${ext}, but detected ${detectedType.mime}.`,
      });
    }

    next();
  } catch (error) {
    // If detection itself fails unexpectedly, don't silently accept — fail safe
    if (req.file) {
      const filePath = path.join(req.file.destination, req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: 'File validation error', error: error.message });
  }
};

module.exports = validateFileContent;