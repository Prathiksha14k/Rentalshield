const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  rentAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  depositAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'under_dispute'],
    default: 'available',
  },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);