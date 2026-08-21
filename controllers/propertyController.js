const Property = require('../models/Property');

// Create a new property (landlord only)
const createProperty = async (req, res) => {
  try {
    const { title, address, rentAmount, depositAmount, description } = req.body;

    const property = await Property.create({
      landlord: req.user._id,
      title,
      address,
      rentAmount,
      depositAmount,
      description,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all properties (public listing, filterable by status)
const getProperties = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const properties = await Property.find(filter).populate('landlord', 'name email');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single property by ID
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('landlord', 'name email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a property (landlord only, must own it)
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Ensure the logged-in landlord owns this property
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this property' });
    }

    const allowedFields = ['title', 'address', 'rentAmount', 'depositAmount', 'description', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    await property.save();
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a property (landlord only, must own it)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this property' });
    }

    await property.deleteOne();
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};