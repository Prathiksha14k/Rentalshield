const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  rentAmount: {
    type: Number,
    required: true,
  },
  depositAmount: {
    type: Number,
    required: true,
  },
  tenantApproved: {
    type: Boolean,
    default: false,
  },
  landlordApproved: {
    type: Boolean,
    default: false,
  },
  agreementHash: {
    type: String,
    default: null,
  },
  onChainAgreementId: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'terminated', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);