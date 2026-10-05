const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createAiReport, getAiReportById, runAiComparison } = require('../controllers/aiReportController');

router.post('/', protect, createAiReport);
router.post('/run', protect, runAiComparison);
router.get('/:id', protect, getAiReportById);

module.exports = router;