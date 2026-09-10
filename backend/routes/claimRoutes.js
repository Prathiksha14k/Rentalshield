const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createClaim, getClaimById, respondToClaim, getClaimsByAgreement, decideClaim } = require('../controllers/claimController');

router.patch('/:id/decide', protect, authorize('admin'), decideClaim);
router.patch('/:id/respond', protect, authorize('tenant'), respondToClaim);
router.post('/', protect, authorize('landlord'), createClaim);
router.get('/agreement/:agreementId', protect, getClaimsByAgreement);
router.get('/:id', protect, getClaimById);

module.exports = router;