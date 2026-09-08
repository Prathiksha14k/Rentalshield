const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createClaim, getClaimById, respondToClaim } = require('../controllers/claimController');
router.patch('/:id/respond', protect, authorize('tenant'), respondToClaim);
router.post('/', protect, authorize('landlord'), createClaim);
router.get('/:id', protect, getClaimById);
module.exports = router;