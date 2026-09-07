const mongoose = require('mongoose');

const labelResultSchema = new mongoose.Schema({
  label: { type: String, required: true },
  similarityScore: { type: Number, required: true },
  moveInPhotoUrl: { type: String, required: true },
  moveOutPhotoUrl: { type: String, required: true }
});

const aiReportSchema = new mongoose.Schema({
  moveInInspection: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', required: true },
  moveOutInspection: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', required: true },
  results: [labelResultSchema],
  reviewStatus: {
    type: String,
    enum: ['pending', 'reviewed'],
    default: 'pending'
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  adminNotes: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('AiReport', aiReportSchema);