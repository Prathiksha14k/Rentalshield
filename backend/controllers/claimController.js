const Claim = require('../models/Claim');
const Agreement = require('../models/Agreement');
const AiReport = require('../models/AiReport');

// @desc    Landlord files a claim against the deposit
// @route   POST /api/claims
const createClaim = async (req, res) => {
  try {
    const { agreementId, description, claimedAmount, aiReportId } = req.body;

    if (!agreementId || !description || claimedAmount === undefined) {
      return res.status(400).json({ message: 'agreementId, description, and claimedAmount are required' });
    }

    if (claimedAmount <= 0) {
      return res.status(400).json({ message: 'claimedAmount must be greater than 0' });
    }

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Only the landlord on this specific agreement can file a claim
    if (agreement.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the landlord for this agreement' });
    }

    if (agreement.status !== 'active') {
      return res.status(400).json({ message: 'Agreement must be active to file a claim' });
    }

    // claimedAmount can't exceed the original deposit
    if (claimedAmount > agreement.depositAmount) {
      return res.status(400).json({ message: 'claimedAmount cannot exceed the deposit amount' });
    }

    // If an aiReportId was provided, verify it exists and belongs to this agreement's inspections
    let aiReportRef = null;
    if (aiReportId) {
      const aiReport = await AiReport.findById(aiReportId);
      if (!aiReport) {
        return res.status(404).json({ message: 'Referenced AI report not found' });
      }
      aiReportRef = aiReport._id;
    }

    const claim = await Claim.create({
      agreement: agreement._id,
      property: agreement.property,
      landlord: agreement.landlord,
      tenant: agreement.tenant,
      aiReport: aiReportRef,
      description,
      claimedAmount
    });

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single claim by ID
// @route   GET /api/claims/:id
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    const userId = req.user._id.toString();
    if (userId !== claim.tenant.toString() && userId !== claim.landlord.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this claim' });
    }

    // Auth check done on raw IDs above — safe to populate now for the response
    await claim.populate('property', 'title address');
    await claim.populate('tenant', 'name email');
    await claim.populate('landlord', 'name email');
    await claim.populate('aiReport');

    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/claims/:id/respond
// Tenant accepts or disputes a claim
const respondToClaim = async (req, res) => {
  try {
    const { response, note } = req.body;

    // Validate response value
    if (!['accept', 'dispute'].includes(response)) {
      return res.status(400).json({ message: "response must be 'accept' or 'dispute'" });
    }

    // Require note if disputing
    if (response === 'dispute' && (!note || note.trim() === '')) {
      return res.status(400).json({ message: 'note is required when disputing a claim' });
    }

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Ownership check: only the tenant on this claim can respond
    if (claim.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this claim' });
    }

    // Must be pending — blocks responding twice
    if (claim.status !== 'pending') {
      return res.status(400).json({ message: `Claim already has status '${claim.status}', cannot respond again` });
    }

    // Map tenant-facing action to internal status
    if (response === 'accept') {
      claim.tenantResponse = 'accepted';
      claim.status = 'accepted';
    } else {
      claim.tenantResponse = 'disputed';
      claim.status = 'admin-review';
    }

    claim.tenantResponseNote = note || '';

    await claim.save();

    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all claims for a specific agreement (optionally filtered by status)
// @route   GET /api/claims/agreement/:agreementId
const getClaimsByAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { status } = req.query;

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    const userId = req.user._id.toString();
    if (userId !== agreement.tenant.toString() && userId !== agreement.landlord.toString()) {
      return res.status(403).json({ message: 'Not authorized to view claims for this agreement' });
    }

    const filter = { agreement: agreementId };
    if (status) {
      filter.status = status;
    }

    const claims = await Claim.find(filter)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .populate('landlord', 'name email')
      .populate('aiReport');

    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClaim, getClaimById, respondToClaim, getClaimsByAgreement };