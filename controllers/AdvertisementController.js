const Advertisement = require("../models/Advertisement");

// ======== Pages ========

// Create a new advertisement page
exports.createPage = async (req, res) => {
  try {
    const { page } = req.body;

    const existing = await Advertisement.findOne({ page });
    if (existing)
      return res.status(400).json({ message: "Page already exists" });

    const newPage = await Advertisement.create({ page, slots: [] });
    res.status(201).json(newPage);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all advertisement pages
exports.getAllPages = async (req, res) => {
  try {
    const pages = await Advertisement.find({}, "page");
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ======== Slots ========

// Get all slots for a page
exports.getSlotsByPage = async (req, res) => {
  try {
    const { page } = req.params;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    res.json(doc.slots);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add or update a slot in a page
exports.upsertSlot = async (req, res) => {
  try {
    const { page } = req.params;
    const { slot, isSlider } = req.body;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slotIndex = doc.slots.findIndex((s) => s.slot === slot);

    if (slotIndex !== -1) {
      doc.slots[slotIndex].isSlider = isSlider;
    } else {
      doc.slots.push({ slot, isSlider, ads: [] });
    }

    await doc.save();
    res.json(doc.slots);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a slot from a page
exports.deleteSlot = async (req, res) => {
  try {
    const { page, slot } = req.params;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    doc.slots = doc.slots.filter((s) => s.slot !== slot);
    await doc.save();

    res.json({ message: "Slot deleted", slots: doc.slots });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ======== Ads ========

// Add a new ad to a slot
exports.addAdToSlot = async (req, res) => {
  try {
    const { page, slot } = req.params;
    const ad = req.body; // expects { type, mediaUrl/htmlContent, link, isActive, sortOrder }

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slotObj = doc.slots.find((s) => s.slot === slot);
    if (!slotObj) return res.status(404).json({ message: "Slot not found" });

    slotObj.ads.push(ad);
    await doc.save();

    res.status(201).json(slotObj.ads);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update an existing ad in a slot
exports.updateAdInSlot = async (req, res) => {
  try {
    const { page, slot, adId } = req.params;
    const updates = req.body;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slotObj = doc.slots.find((s) => s.slot === slot);
    if (!slotObj) return res.status(404).json({ message: "Slot not found" });

    const ad = slotObj.ads.id(adId);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    Object.assign(ad, updates);
    await doc.save();

    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete an ad from a slot
exports.deleteAdFromSlot = async (req, res) => {
  try {
    const { page, slot, adId } = req.params;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slotObj = doc.slots.find((s) => s.slot === slot);
    if (!slotObj) return res.status(404).json({ message: "Slot not found" });

    slotObj.ads = slotObj.ads.filter((ad) => ad._id.toString() !== adId);
    await doc.save();

    res.json({ message: "Ad deleted", ads: slotObj.ads });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Bulk add ads to a slot
exports.bulkAddAdsToSlot = async (req, res) => {
  try {
    const { page, slot } = req.params;
    const ads = req.body; // expects array of { type, mediaUrl/htmlContent, link, isActive, sortOrder }

    if (!Array.isArray(ads)) {
      return res
        .status(400)
        .json({ message: "Request body must be an array of ads" });
    }

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slotObj = doc.slots.find((s) => s.slot === slot);
    if (!slotObj) return res.status(404).json({ message: "Slot not found" });

    slotObj.ads.push(...ads);
    await doc.save();

    res.status(201).json(slotObj.ads);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Bulk delete ads from a slot
exports.bulkDeleteAdsFromSlot = async (req, res) => {
  try {
    const { page, slot } = req.params;
    const { adIds } = req.body; // expects { adIds: ["id1", "id2", ...] }

    if (!Array.isArray(adIds)) {
      return res.status(400).json({ message: "adIds must be an array" });
    }

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slotObj = doc.slots.find((s) => s.slot === slot);
    if (!slotObj) return res.status(404).json({ message: "Slot not found" });

    slotObj.ads = slotObj.ads.filter(
      (ad) => !adIds.includes(ad._id.toString())
    );
    await doc.save();

    res.json({ message: "Ads deleted", ads: slotObj.ads });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
