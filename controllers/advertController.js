const Ad = require("../models/Advert");
const SlotPurchase = require("../models/SlotPurchase");
const AdvertSlot = require("../models/AdvertSlot");

// 1. Create Ad
exports.createAd = async (req, res) => {
  try {
    const { slotId, businessId, type, contentUrl, description, priority } =
      req.body;

    const slot = await AdvertSlot.findById(slotId);
    if (!slot)
      return res.status(404).json({ message: "Advert slot not found" });

    // Check if business is allowed for this slot
    if (!slot.allowedBusinesses.includes(businessId)) {
      return res
        .status(403)
        .json({ message: "Business not allowed for this slot" });
    }

    // Check max ads for this slot
    const activeAdCount = await Ad.countDocuments({ slotId, isActive: true });
    if (activeAdCount >= slot.maxAds) {
      return res.status(400).json({ message: "Max ads reached for this slot" });
    }

    // Use current time as startDate
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + (slot.adDurationInDays || 30));

    const newAd = await Ad.create({
      slotId,
      businessId,
      type,
      contentUrl,
      description,
      priority,
      startDate: start,
      endDate: end,
    });

    await SlotPurchase.findOneAndUpdate(
      {
        slotId,
        businessId,
        status: "pendingupload", // only update pending ones
      },
      {
        status: "completed",
        adId: newAd._id,
      },
      { new: true }
    );

    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Ads (all / filter by slotId or businessId)
exports.getAds = async (req, res) => {
  try {
    const { slotId, businessId } = req.query;
    const filter = {};
    filter.isActive = true;
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
    const updatedAd = await Ad.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedAd) return res.status(404).json({ message: "Ad not found" });

    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Ad
exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAd = await Ad.findByIdAndDelete(id);
    if (!deletedAd) return res.status(404).json({ message: "Ad not found" });

    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Toggle Ad Active Status
exports.toggleAdStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findById(id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    ad.isActive = !ad.isActive;
    await ad.save();

    res.json({ message: `Ad ${ad.isActive ? "activated" : "deactivated"}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
