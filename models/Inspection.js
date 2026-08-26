const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  hash: { type: String, required: true },
  label: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const inspectionSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  agreement: { type: mongoose.Schema.Types.ObjectId, ref: 'Agreement', required: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['move-in', 'move-out'], required: true },
  photos: [photoSchema],
  tenantApproved: { type: Boolean, default: false },
  landlordApproved: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'completed', 'disputed'],
    default: 'pending'
  },
   disputeReason: { type: String, default: null },
  disputedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  onChainInspectionId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Inspection', inspectionSchema);