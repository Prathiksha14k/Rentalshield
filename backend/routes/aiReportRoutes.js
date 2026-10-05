const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAiReport,
  getAiReportById,
  runAiComparison,
  getAiReportsByAgreement
} = require('../controllers/aiReportController');

router.post('/', protect, createAiReport);
router.post('/run', protect, runAiComparison);
router.get('/agreement/:agreementId', protect, getAiReportsByAgreement);
router.get('/:id', protect, getAiReportById);

module.exports = router;