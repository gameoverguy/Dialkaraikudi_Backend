const AdvertSlot = require("../models/AdvertSlot");

// Create a new advert slot
exports.createSlot = async (req, res) => {
  try {
    const slot = await AdvertSlot.create(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an advert slot
exports.updateSlot = async (req, res) => {
  try {
    const updated = await AdvertSlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Slot not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an advert slot
exports.deleteSlot = async (req, res) => {
  try {
    const deleted = await AdvertSlot.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Slot not found" });
    res.json({ message: "Slot deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all slots
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await AdvertSlot.find().populate("allowedBusinesses");
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
