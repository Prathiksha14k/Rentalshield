const Inspection = require('../models/Inspection');
const Agreement = require('../models/Agreement');
const cloudinary = require('../config/cloudinary');
const { generateFileHash } = require('../utils/hashUtils');

// @desc    Create a new inspection (move-in or move-out) for an active agreement
// @route   POST /api/inspections
const createInspection = async (req, res) => {
  try {
    const { agreementId, type } = req.body;

    if (!agreementId || !type) {
      return res.status(400).json({ message: 'agreementId and type are required' });
    }

    if (!['move-in', 'move-out'].includes(type)) {
      return res.status(400).json({ message: 'type must be move-in or move-out' });
    }

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    if (agreement.status !== 'active') {
      return res.status(400).json({ message: 'Agreement must be active to start an inspection' });
    }

    // Only the tenant or landlord on this specific agreement can create an inspection for it
    const userId = req.user._id.toString();
    if (userId !== agreement.tenant.toString() && userId !== agreement.landlord.toString()) {
      return res.status(403).json({ message: 'Not authorized for this agreement' });
    }

    // Prevent duplicate inspections of the same type for the same agreement
    const existing = await Inspection.findOne({ agreement: agreementId, type });
    if (existing) {
      return res.status(400).json({ message: `A ${type} inspection already exists for this agreement` });
    }

    const inspection = await Inspection.create({
      property: agreement.property,
      agreement: agreement._id,
      tenant: agreement.tenant,
      landlord: agreement.landlord,
      type,
      photos: []
    });

    res.status(201).json(inspection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload one or more photos to an inspection
// @route   POST /api/inspections/:id/photos
const uploadInspectionPhotos = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    const userId = req.user._id.toString();
    if (userId !== inspection.tenant.toString() && userId !== inspection.landlord.toString()) {
      return res.status(403).json({ message: 'Not authorized for this inspection' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }

    const uploadedPhotos = [];

    for (const file of req.files) {
      const hash = generateFileHash(file.buffer);

      const cloudinaryResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'rentalshield/inspections', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      uploadedPhotos.push({
        url: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        hash,
        uploadedBy: req.user._id
      });
    }

    inspection.photos.push(...uploadedPhotos);
    await inspection.save();

    res.status(200).json(inspection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single inspection by ID
// @route   GET /api/inspections/:id
const getInspectionById = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    const userId = req.user._id.toString();
    if (userId !== inspection.tenant.toString() && userId !== inspection.landlord.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this inspection' });
    }

    await inspection.populate('property', 'title address');
    await inspection.populate('tenant', 'name email');
    await inspection.populate('landlord', 'name email');

    res.status(200).json(inspection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createInspection, uploadInspectionPhotos, getInspectionById };