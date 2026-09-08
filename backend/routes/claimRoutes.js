const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createClaim, getClaimById } = require('../controllers/claimController');

router.post('/', protect, authorize('landlord'), createClaim);
router.get('/:id', protect, getClaimById);

module.exports = router;