const Ad = require("../models/Advert");
const AdvertSlot = require("../models/AdvertSlot");
const Business = require("../models/Business");

// 1. Create Ad
exports.createAd = async (req, res) => {
  try {
    const slot = await AdvertSlot.findById(req.body.slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (!slot.allowedBusinesses.includes(req.body.businessId)) {
      return res
        .status(403)
        .json({ message: "Business not allowed for this slot" });
    }

    const adCount = await Ad.countDocuments({
      slotId: req.body.slotId,
      isActive: true,
    });
    if (adCount >= slot.maxAds) {
      return res.status(400).json({ message: "Max ads reached for this slot" });
    }

    const ad = await Ad.create(req.body);

    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Ads (all, by slot, by business)
exports.getAds = async (req, res) => {
  try {
    const { slotId, businessId } = req.query;

    let filter = {};
    if (slotId) filter.slotId = slotId;
    if (businessId) filter.businessId = businessId;

    const ads = await Ad.find(filter)
      .populate("slotId", "name page")
      .populate("businessId", "businessName");

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Ad
exports.updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Ad.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Ad not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Ad
exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Ad.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Ad not found" });

    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Get Allowed Slots for a Business
exports.getAllowedSlotsForBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const slots = await AdvertSlot.find({ allowedBusinesses: businessId });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Admin - Assign business to slot
exports.assignBusinessToSlot = async (req, res) => {
  try {
    const { slotId, businessId } = req.body;

    const slot = await AdvertSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (!slot.allowedBusinesses.includes(businessId)) {
      slot.allowedBusinesses.push(businessId);
      await slot.save();
    }

    res.json({ message: "Business assigned to slot successfully", slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
