const Advertisement = require("../models/Advertisement");

// Get slots for home page
exports.getHomeSlots = async (req, res) => {
  try {
    let doc = await Advertisement.findOne({ page: "home" });
    if (!doc) {
      doc = await Advertisement.create({ page: "home", slots: [] });
    }
    res.json({ slots: doc.slots });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create a new slot
exports.createSlot = async (req, res) => {
  try {
    const { heading, images } = req.body;

    let doc = await Advertisement.findOne({ page: "home" });
    if (!doc) {
      doc = await Advertisement.create({ page: "home", slots: [] });
    }

    const newSlot = {
      heading: heading || "",
      images: images || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    doc.slots.push(newSlot);
    await doc.save();

    res.status(201).json({ data: newSlot });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update a slot
exports.updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { heading, images } = req.body;

    const doc = await Advertisement.findOne({ page: "home" });
    if (!doc) {
      return res.status(404).json({ message: "Home page not found" });
    }

    const slot = doc.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (heading !== undefined) slot.heading = heading;
    if (images !== undefined) slot.images = images;
    slot.updatedAt = new Date();

    await doc.save();
    res.json({ message: "Slot updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a slot
exports.deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const doc = await Advertisement.findOne({ page: "home" });
    if (!doc) {
      return res.status(404).json({ message: "Home page not found" });
    }

    doc.slots = doc.slots.filter((slot) => slot._id.toString() !== slotId);
    await doc.save();

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
