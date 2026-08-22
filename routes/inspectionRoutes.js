const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createInspection,
  uploadInspectionPhotos,
  getInspectionById
} = require('../controllers/inspectionController');

router.post('/', protect, createInspection);
router.post('/:id/photos', protect, upload.array('photos', 10), uploadInspectionPhotos);
router.get('/:id', protect, getInspectionById);

module.exports = router;