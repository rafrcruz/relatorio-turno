const path = require('path');
const multer = require('multer');

// Use memory storage so files are available in req.file/req.files as buffers.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

// Keep a reference for legacy imports; no actual disk usage in serverless
const uploadDir = path.join(__dirname, '..', 'uploads');

module.exports = { upload, uploadDir };
