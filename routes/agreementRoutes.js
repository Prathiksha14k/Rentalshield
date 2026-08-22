const express = require('express');
const router = express.Router();
const {
  createAgreement,
  getMyAgreements,
  getAgreementById,
  rejectAgreement,
  approveAgreement,
} = require('../controllers/agreementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('tenant'), createAgreement);
router.get('/mine', protect, getMyAgreements);
router.get('/:id', protect, getAgreementById);
router.patch('/:id/reject', protect, authorize('landlord'), rejectAgreement);
router.patch('/:id/approve', protect, approveAgreement);

module.exports = router;