const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createInspection,
  uploadInspectionPhotos,
  getInspectionById,
  approveInspection,
  disputeInspection
} = require('../controllers/inspectionController');

router.post('/', protect, createInspection);
router.post('/:id/photos', protect, upload.array('photos', 10), uploadInspectionPhotos);
router.get('/:id', protect, getInspectionById);
router.patch('/:id/approve', protect, approveInspection);
router.patch('/:id/dispute', protect, disputeInspection);

module.exports = router;