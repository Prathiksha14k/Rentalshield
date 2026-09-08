const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  agreement: { type: mongoose.Schema.Types.ObjectId, ref: 'Agreement', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  aiReport: { type: mongoose.Schema.Types.ObjectId, ref: 'AiReport', default: null },
  description: { type: String, required: true },
  claimedAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'admin-review'],
    default: 'pending'
  },
  tenantResponse: {
    type: String,
    enum: ['none', 'accepted', 'disputed'],
    default: 'none'
  },
  tenantResponseNote: { type: String, default: null },
  adminDecision: { type: String, default: null },
  adminDecidedAmount: { type: Number, default: null },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);