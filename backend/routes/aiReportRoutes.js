const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createAiReport, getAiReportById } = require('../controllers/aiReportController');

router.post('/', protect, createAiReport);
router.get('/:id', protect, getAiReportById);

module.exports = router;