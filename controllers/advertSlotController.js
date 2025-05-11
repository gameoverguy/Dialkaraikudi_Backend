const AdvertSlot = require("../models/advertSlot");

// Create a new advert slot
exports.createSlot = async (req, res) => {
  try {
    const slot = await AdvertSlot.create(req.body);
    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all advert slots
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await AdvertSlot.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single slot by ID
exports.getSlotById = async (req, res) => {
  try {
    const slot = await AdvertSlot.findById(req.params.id);
    if (!slot) {
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });
    }
    res.status(200).json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a slot
exports.updateSlot = async (req, res) => {
  try {
    const updatedSlot = await AdvertSlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSlot) {
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });
    }
    res.status(200).json({ success: true, data: updatedSlot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a slot
exports.deleteSlot = async (req, res) => {
  try {
    const deletedSlot = await AdvertSlot.findByIdAndDelete(req.params.id);
    if (!deletedSlot) {
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
