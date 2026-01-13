const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Cloudinary returns the URL in 'path' or 'secure_url'
  const filePath = req.file.path || req.file.secure_url;

  res.json({
    success: true,
    data: {
      url: filePath,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
});

module.exports = router;
