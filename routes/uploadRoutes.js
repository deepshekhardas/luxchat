const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Return the file path (relative to server root)
    // Client invokes static file serving: http://localhost:5001/uploads/filename.jpg
    const filePath = `/uploads/${req.file.filename}`;

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
