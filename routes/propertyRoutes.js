const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', protect, authorize('landlord'), createProperty);
router.patch('/:id', protect, authorize('landlord'), updateProperty);
router.delete('/:id', protect, authorize('landlord'), deleteProperty);

module.exports = router;