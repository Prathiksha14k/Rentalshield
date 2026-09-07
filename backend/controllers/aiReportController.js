const AiReport = require('../models/AiReport');
const Inspection = require('../models/Inspection');

const SIMILARITY_THRESHOLD = 0.97; // photos scoring below this are flagged for admin review — needs recalibration once more real test data exists

// @desc    Save a new AI comparison report (called by the Flask AI service)
// @route   POST /api/ai-reports
const createAiReport = async (req, res) => {
  try {
    const { moveInInspectionId, moveOutInspectionId, results } = req.body;

    if (!moveInInspectionId || !moveOutInspectionId || !results) {
      return res.status(400).json({ message: 'moveInInspectionId, moveOutInspectionId, and results are required' });
    }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ message: 'results must be a non-empty array' });
    }

    const moveInInspection = await Inspection.findById(moveInInspectionId);
    const moveOutInspection = await Inspection.findById(moveOutInspectionId);

    if (!moveInInspection || !moveOutInspection) {
      return res.status(404).json({ message: 'One or both inspections not found' });
    }

    const userId = req.user._id.toString();
    const isAuthorized =
      userId === moveInInspection.tenant.toString() ||
      userId === moveInInspection.landlord.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized for these inspections' });
    }

    // Attach a flag to each result based on the threshold
    const flaggedResults = results.map((r) => ({
      ...r,
      flaggedForReview: r.similarityScore < SIMILARITY_THRESHOLD
    }));

    const aiReport = await AiReport.create({
      moveInInspection: moveInInspectionId,
      moveOutInspection: moveOutInspectionId,
      results: flaggedResults
    });

    res.status(201).json(aiReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single AI report by ID
// @route   GET /api/ai-reports/:id
const getAiReportById = async (req, res) => {
  try {
    const aiReport = await AiReport.findById(req.params.id)
      .populate('moveInInspection', 'type property')
      .populate('moveOutInspection', 'type property');

    if (!aiReport) {
      return res.status(404).json({ message: 'AI report not found' });
    }

    res.status(200).json(aiReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAiReport, getAiReportById };