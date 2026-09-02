const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');

let images = [];

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newImage = {
      _id: Date.now().toString(),
      imageUrl,
      createdAt: new Date().toISOString()
    };

    images.unshift(newImage);
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', (req, res) => {
  res.status(200).json(images);
});

router.delete('/:id', (req, res) => {
  try {
    const imageIndex = images.findIndex((img) => img._id === req.params.id);
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const image = images[imageIndex];
    // Extract filename whether path is relative (/uploads/file) or absolute (http://.../uploads/file)
    const filename = path.basename(image.imageUrl);

    if (filename) {
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    images.splice(imageIndex, 1);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;