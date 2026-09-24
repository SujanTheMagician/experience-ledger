const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadFile } = require('../controllers/uploadController');

// POST /api/uploads -> upload one evidence file (requires login), field name "file"
router.post('/', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'File must be 10MB or smaller' : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    return next();
  });
}, uploadFile);

module.exports = router;
