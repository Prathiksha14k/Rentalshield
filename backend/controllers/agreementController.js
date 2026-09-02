const Agreement = require('../models/Agreement');
const Property = require('../models/Property');
const { generateHash } = require('../utils/hashUtils');

// Tenant requests to rent a property
const createAgreement = async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'available') {
      return res.status(400).json({ message: 'Property is not available for rent' });
    }

    const agreement = await Agreement.create({
      property: property._id,
      tenant: req.user._id,
      landlord: property.landlord,
      startDate,
      endDate,
      rentAmount: property.rentAmount,
      depositAmount: property.depositAmount,
    });

    res.status(201).json(agreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all agreements belonging to the logged-in user (tenant or landlord)
const getMyAgreements = async (req, res) => {
  try {
    const filter = req.user.role === 'landlord'
      ? { landlord: req.user._id }
      : { tenant: req.user._id };

    const agreements = await Agreement.find(filter)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .populate('landlord', 'name email');

    res.status(200).json(agreements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single agreement by ID
const getAgreementById = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .populate('landlord', 'name email');

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Only the tenant or landlord involved can view it
    const isTenant = agreement.tenant._id.toString() === req.user._id.toString();
    const isLandlord = agreement.landlord._id.toString() === req.user._id.toString();

    if (!isTenant && !isLandlord && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have access to this agreement' });
    }

    res.status(200).json(agreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Landlord rejects a pending agreement request
const rejectAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    if (agreement.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the landlord for this agreement' });
    }

    if (agreement.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending agreements can be rejected' });
    }

    agreement.status = 'rejected';
    await agreement.save();

    res.status(200).json(agreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Tenant or landlord digitally approves the agreement
const approveAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    const isTenant = agreement.tenant.toString() === req.user._id.toString();
    const isLandlord = agreement.landlord.toString() === req.user._id.toString();

    if (!isTenant && !isLandlord) {
      return res.status(403).json({ message: 'You are not part of this agreement' });
    }

    if (agreement.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending agreements can be approved' });
    }

    if (isTenant) agreement.tenantApproved = true;
    if (isLandlord) agreement.landlordApproved = true;

    // If both sides have approved, activate the agreement
    if (agreement.tenantApproved && agreement.landlordApproved) {
      agreement.status = 'active';

      // Generate the agreement hash — will later be anchored on-chain
      agreement.agreementHash = generateHash({
        agreementId: agreement._id.toString(),
        property: agreement.property.toString(),
        tenant: agreement.tenant.toString(),
        landlord: agreement.landlord.toString(),
        startDate: agreement.startDate,
        endDate: agreement.endDate,
        depositAmount: agreement.depositAmount,
      });

      // Mark the property as rented
      await Property.findByIdAndUpdate(agreement.property, { status: 'rented' });
    }

    await agreement.save();
    res.status(200).json(agreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAgreement,
  getMyAgreements,
  getAgreementById,
  rejectAgreement,
  approveAgreement,
};